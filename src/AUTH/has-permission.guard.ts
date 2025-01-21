import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DbService } from '../DB/db.service';
import { MyRequest, VerifyMetaData } from '../types';
// 是否有权操作资源
@Injectable()
export class HasPermissionGuard implements CanActivate {
	constructor(
		public reflector: Reflector,
		public dbService: DbService
	) {}
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const verifyMetaData: VerifyMetaData = this.reflector.getAllAndOverride('verify', [
			context.getClass(),
			context.getHandler()
		]);
		if (!verifyMetaData.requireOwn) {
			return true;
		}
		// 获取 is-login.guard 保证的用户信息
		const request = context.switchToHttp().getRequest<MyRequest>();
		const userInfo = request.userInfo;
		// 查询用户是否拥有该资源
		const tableName = verifyMetaData.tableName;
		//* 接口的参数名得是表名Id格式
		const resourceId = request.params[`${tableName}Id`];
		const values = this.dbService[tableName].findUnique({
			where: {
				user_id: userInfo.userId,
				id: resourceId
			}
		});
		if (values !== null) {
			return true;
		} else {
			return false;
		}
	}
}
