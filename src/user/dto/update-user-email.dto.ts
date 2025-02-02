import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserEmailDto {
	@IsNotEmpty({
		message: '邮箱不能为空'
	})
	@IsEmail(
		{},
		{
			message: '不是合法的邮箱格式'
		}
	)
	email: string;

	@IsNotEmpty({
		message: '用户名不能为空'
	})
	username: string;

	@IsNotEmpty({
		message: '验证码不能为空'
	})
	captcha: string;
}
