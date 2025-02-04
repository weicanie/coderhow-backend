import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
//X: import { DbService } from '../db/db.service';
import { DbService } from '../DB/db.service';
import { OssService } from '../OSS/oss.service';
import { RedisService } from '../REDIS/redis.service';
import { UserInfoFromToken } from '../types';
import { passwordEncrypt, resBundle } from '../utils';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
type UserInfo = {
	id: number;
	username: string;
	password: string;
	avatar_url: string | null;
	create_at: Date | null;
	update_at: Date | null;
	sign: string | null;
	nickName: string;
	email: string;
};
// TODO 错误处理,映射表没安排上 (统一success, 免得客户端报错)
@Injectable()
export class UserService {
	@Inject(RedisService)
	private redisService: RedisService;
	private logger = new Logger();

	constructor(
		@Inject(DbService)
		private readonly dbService: DbService,
		@Inject(JwtService)
		private readonly JwtService: JwtService,
		@Inject(OssService)
		private readonly ossService: OssService
	) {}
	async regist(user: RegisterUserDto) {
		const captcha = await this.redisService.get(`captcha_${user.email}`);

		if (!captcha) {
			throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
		}

		if (user.captcha !== captcha) {
			throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
		}

		const userInfo = await this.dbService.user.findUnique({
			where: {
				username: user.username
			}
		});

		if (userInfo) {
			throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
		}
		user.password = passwordEncrypt(user.password);
		try {
			const userRes = await this.dbService.user.create({
				data: {
					username: user.username,
					password: user.password,
					nickName: user.nickName ? user.nickName : user.username,
					email: user.email,
					online_status: 'online'
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true,
					avatar_url: true,
					create_at: true
				}
			});
			return resBundle<typeof userRes>(userRes);
		} catch (e) {
			this.logger.error(e, UserService);
			return null;
		}
	}

	async login(loginUserDto: LoginUserDto) {
		const userInfo = await this.dbService.user.findUnique({
			where: {
				username: loginUserDto.username
			}
		});

		if (!userInfo) {
			throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
		}
		await this.pwdVerify(userInfo, loginUserDto.password);
		const token = await this.tokenDispatch(userInfo, userInfo.id);
		const userRes = await this.dbService.user.findUnique({
			where: {
				id: userInfo.id
			}
		});
		delete userRes.password;
		await this.dbService.user.update({
			where: {
				username: loginUserDto.username
			},
			data: {
				online_status: 'online'
			}
		});
		return resBundle({ ...userRes, token });
	}
	async logout(username: string) {
		const userInfo = await this.dbService.user.findUnique({
			where: {
				username
			}
		});

		if (!userInfo) {
			throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
		}
		await this.dbService.user.update({
			where: {
				username
			},
			data: {
				online_status: 'offline'
			}
		});
		return resBundle('已退出登录');
	}
	async pwdVerify(userInfo: UserInfo, password: string) {
		if (userInfo.password !== passwordEncrypt(password)) {
			throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
		}
	}
	async tokenDispatch(userInfo: UserInfo, userId: number) {
		const { username } = userInfo;
		const token = this.JwtService.sign(
			{ userId, username },
			{
				privateKey: process.env.PRIVATE_KEY,
				algorithm: 'RS256',
				expiresIn: 24 * 60 * 60 * 7
			}
		);
		return token;
	}
	async findUserDetailById(userId: number) {
		const user = await this.dbService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				username: true,
				nickName: true,
				email: true,
				avatar_url: true,
				create_at: true,
				update_at: true,
				sign: true
			}
		});
		return user;
	}
	async findUserDetailByName(username: string) {
		const users = await this.dbService.user.findMany({
			where: {
				username: {
					contains: username
				}
			},
			select: {
				id: true,
				username: true,
				nickName: true,
				email: true,
				avatar_url: true,
				create_at: true,
				update_at: true,
				sign: true
			}
		});
		return resBundle(users);
	}

	async uploadAvatar(userInfo: UserInfoFromToken, name: string, bucketName = 'coderhow') {
		// 防重复
		name = userInfo.username + name;
		const url = await this.ossService.presignedPutObject(name, bucketName);
		await this.dbService.user.update({
			data: {
				avatar_url: `${process.env.OSS_SERVER_URL}/${bucketName}/${name}`
			},
			where: {
				id: +userInfo.userId
			}
		});
		return url;
	}

	async updatePassword(passwordDto: UpdateUserPasswordDto) {
		/* 		const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`);

		if (!captcha) {
			throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
		}

		if (passwordDto.captcha !== captcha) {
			throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
		} */

		const { id: userId } = await this.dbService.user.findUnique({
			where: {
				username: passwordDto.username
			},
			select: {
				id: true
			}
		});

		try {
			await this.dbService.user.update({
				where: {
					id: userId
				},
				data: {
					password: passwordDto.password
				}
			});
			return resBundle('密码修改成功');
		} catch (e) {
			this.logger.error(e, UserService);
			return '密码修改失败';
		}
	}

	async updateInfo(userId: number, updateUserDto: UpdateUserDto) {
		/* 		const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`);

		if (!captcha) {
			throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
		}

		if (updateUserDto.captcha !== captcha) {
			throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
		} */

		const userInfo = await this.dbService.user.findUnique({
			where: {
				id: userId
			}
		});

		if (updateUserDto.nickName) {
			userInfo.nickName = updateUserDto.nickName;
		}
		if (updateUserDto.signature) {
			userInfo.sign = updateUserDto.signature;
		}
		/* 		if (updateUserDto.avatar_url) {
			userInfo.avatar_url = updateUserDto.avatar_url;
		} */

		try {
			const user = await this.dbService.user.update({
				where: {
					id: userId
				},
				data: userInfo
			});
			const token = this.tokenDispatch(user, user.id);
			return resBundle({ token, ...user });
		} catch (e) {
			this.logger.error(e, UserService);
			return '用户信息修改成功';
		}
	}

	async updateEmail(userId: number, updateUserEmailDto: UpdateUserEmailDto) {
		const captcha = await this.redisService.get(`update_user_captcha_${updateUserEmailDto.email}`);

		if (!captcha) {
			throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
		}

		if (updateUserEmailDto.captcha !== captcha) {
			throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
		}

		const userInfo = await this.dbService.user.findUnique({
			where: {
				id: userId
			}
		});

		if (updateUserEmailDto.email) {
			userInfo.email = updateUserEmailDto.email;
		}

		try {
			await this.dbService.user.update({
				where: {
					id: userId
				},
				data: userInfo
			});
			return resBundle('邮箱修改成功');
		} catch (e) {
			this.logger.error(e, UserService);
			return '邮箱修改失败';
		}
	}
}
