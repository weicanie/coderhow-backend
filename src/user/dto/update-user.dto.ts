export class UpdateUserDto {
	nickName: string;

	/* 	@IsNotEmpty({
		message: '邮箱不能为空'
	})
	@IsEmail(
		{},
		{
			message: '不是合法的邮箱格式'
		}
	)
	email: string; */

	signature: string;
}
