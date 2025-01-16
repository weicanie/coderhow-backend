import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DbService } from '../db/db.service';
import { passwordEncrypt } from '../utils';
import { UserInfo } from './dto/user-info.dto';
@Injectable()
export class UserService {
	constructor(
		public dbService: DbService,
		public JwtService: JwtService
	) {}
	async createUser(userInfo: UserInfo) {
		let { username, password } = userInfo;
		await this.userInfoCheck(userInfo);
		password = passwordEncrypt(password);
		const res = await this.addUser(username, password);
		return res;
	}
	async userInfoCheck(userInfo: UserInfo) {
		const { username, password } = userInfo;
		if (!username || !password) {
			//TODO错误处理
			// ctx.app.emit('error', new Error('-1001'), ctx);
			return;
		}
		const userInfoR = await this.getUsername(username);
		if (userInfoR !== null) {
			//TODO错误处理
			// ctx.app.emit('error', new Error('-1002'), ctx);
			return;
		}
		return userInfoR;
	}

	async login(userInfo: UserInfo) {
		const { password: md5pwd, id: userId } = await this.userInfoCheck(userInfo);
		await this.pwdVerify(userInfo, md5pwd);
		return await this.tokenDispatch(userInfo, userId);
	}
	async pwdVerify(userInfo: UserInfo, md5pwd: string) {
		const { password } = userInfo;
		if (md5pwd !== passwordEncrypt(password)) {
			//TODO错误处理
			// ctx.app.emit('error', new Error('-1004'), ctx);
			return;
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

	async uploadSign(userId: string, sign: string) {
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
