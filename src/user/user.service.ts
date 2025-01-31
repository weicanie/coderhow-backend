import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { DbService } from '../db/db.service';
import { DbService } from '../DB/db.service';
import { OssService } from '../OSS/oss.service';
import { UserInfoFromToken } from '../types';
import { passwordEncrypt } from '../utils';
import { UserInfoDto } from './dto/user-info.dto';
@Injectable()
export class UserService {
	constructor(
		@Inject(DbService)
		private readonly dbService: DbService,
		@Inject(JwtService)
		private readonly JwtService: JwtService,
		@Inject(OssService)
		private readonly ossService: OssService
	) {}
	async createUser(userInfo: UserInfoDto) {
		let { username, password } = userInfo;
		await this.userInfoCheck(userInfo);
		password = passwordEncrypt(password);
		const res = await this.addUser(username, password);
		return res;
	}
	async userInfoCheck(userInfo: UserInfoDto) {
		const { username, password } = userInfo;
		if (!username || !password) {
			throw new BadRequestException('用户名或密码不能为空');
		}
		const userInfoData = await this.getUsername(username);
		if (userInfoData !== null) {
			throw new BadRequestException('用户名已存在');
		}
		return userInfoData;
	}

	async login(userInfo: UserInfoDto) {
		const { password: pwd, id: userId } = await this.getUsername(userInfo.username);
		if (!userInfo.username || !pwd) {
			throw new BadRequestException('用户名或密码不能为空');
		}
		await this.pwdVerify(userInfo, pwd);
		const token = await this.tokenDispatch(userInfo, userId);
		const res = await this.dbService.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				create_at: true,
				update_at: true,
				username: true,
				avatar_url: true,
				sign: true
			}
		});

		return { ...res, token };
	}
	async pwdVerify(userInfo: UserInfoDto, md5pwd: string) {
		const { password } = userInfo;
		if (md5pwd !== passwordEncrypt(password)) {
			throw new BadRequestException('密码错误');
		}
	}
	async tokenDispatch(userInfo: UserInfoDto, userId: number) {
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

	async getUsername(username: string) {
		const userInfo = await this.dbService.user.findUnique({
			where: {
				username
			}
		});
		return userInfo;
	}

	async addUser(username: string, password: string) {
		try {
			await this.dbService.user.create({
				data: {
					username,
					password
				}
			});
			return '注册成功';
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}

	async uploadSign(userInfo: UserInfoFromToken, sign: string) {
		const { userId } = userInfo;
		const res = await this.dbService
			.$executeRaw`UPDATE user SET sign = ${sign} WHERE id = ${userId}`;
		return res;
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

	async getUserInfo(userId: string) {
		const value = await this.dbService.user.findUnique({
			where: {
				id: +userId
			},
			select: {
				id: true,
				create_at: true,
				update_at: true,
				username: true,
				avatar_url: true,
				sign: true
			}
		});
		// if (value) {
		// 	Reflect.deleteProperty(value, 'password');
		// }
		return value;
	}
}
