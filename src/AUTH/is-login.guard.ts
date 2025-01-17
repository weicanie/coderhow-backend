import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { UserInfoFromToken, VerifyMetaData } from '../types';
@Injectable()
export class IsLoginGuard implements CanActivate {
	constructor(
		public reflector: Reflector,
		public jwtService: JwtService
	) {}
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const verify: VerifyMetaData = this.reflector.getAllAndOverride('verify', [
			context.getClass(),
			context.getHandler()
		]);
		if (!verify.requireLogin) {
			return true;
		}
		// jwt鉴定token,并提取用户信息
		const request = context.switchToHttp().getRequest<Request>();
		let token: string = request.body.token;
		token = token.replace('bear ', '');
		let userInfo: UserInfoFromToken;
		try {
			userInfo = this.jwtService.verify(token, {
				publicKey: process.env.PUBLIC_KEY
			});
		} catch (error) {
			throw new UnauthorizedException('用户未登录');
		}
		// 无感续token
		const { userId, username } = userInfo;
		const newToken = this.jwtService.sign(
			{ userId, username },
			{
				privateKey: process.env.PRIVATE_KEY,
				algorithm: 'RS256',
				expiresIn: 24 * 60 * 60 * 7
			}
		);
		const response = context.switchToHttp().getResponse<Response>();
		response.setHeader('token', newToken);
		return true;
	}
}
