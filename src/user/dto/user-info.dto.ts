import { ApiProperty } from '@nestjs/swagger';

// TODO 'validate'对dto进行校验
export class UserInfoDto {
	@ApiProperty({ name: 'username' })
	username: string;

	@ApiProperty({ name: 'password' })
	password: string;
}
