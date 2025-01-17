import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';
import { UserInfoFromToken } from '../types';
import { passwordEncrypt } from '../utils';
import { UserInfoDto } from './dto/user-info.dto';
@Injectable()
export class UserService {
	constructor(
		public dbService: DbService,
		public JwtService: JwtService
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
		const userInfoR = await this.getUsername(username);
		if (userInfoR !== null) {
			throw new BadRequestException('用户名已存在');
		}
		return userInfoR;
	}

	async login(userInfo: UserInfoDto) {
		const { password: md5pwd, id: userId } = await this.userInfoCheck(userInfo);
		await this.pwdVerify(userInfo, md5pwd);
		return await this.tokenDispatch(userInfo, userId);
	}
	async pwdVerify(userInfo: UserInfoDto, md5pwd: string) {
		const { password } = userInfo;
		if (md5pwd !== passwordEncrypt(password)) {
			throw new BadRequestException('密码错误');
			return;
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
		const avatar_url = `${process.env.HOST}:${process.env.PORT}/avatar/${userId}`;
		return {
			userId,
			username,
			token,
			avatar_url
		};
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
		const res = await this.dbService
			.$executeRaw`INSERT INTO user (username, password) VALUES (${username},${password})`;
		return res;
	}

	async uploadSign(userInfo: UserInfoFromToken, sign: string) {
		const { userId } = userInfo;
		const res = await this.dbService
			.$executeRaw`UPDATE user SET sign = ${sign} WHERE id = ${userId}`;
		return res;
	}

	async getUserInfo(userId: string) {
		const values: unknown[] = await this.dbService
			.$queryRaw`SELECT id, username, avatar_url, sign FROM user WHERE id =${userId}`;
		return values;
	}
}
