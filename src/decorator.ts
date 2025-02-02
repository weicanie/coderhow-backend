import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { MyRequest } from './types';

// 标识某个 handler 需要登录才能执行。
const RequireLogin = () =>
	SetMetadata('verify', {
		requireLogin: true
	});
// 标识某个 handler 需要拥有该资源操作权限才能执行。
const RequirePermission = (tableName: string) =>
	SetMetadata('verify', {
		requireOwn: true,
		tableName
	});
// 获取 request 对象中通过 Guard 储存的用户信息。
const UserInfo = createParamDecorator((param: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<MyRequest>();
	if (!request.userInfo) {
		return null;
	}
	return param ? request.userInfo[param] : request.userInfo;
});
export { RequireLogin, RequirePermission, UserInfo };
