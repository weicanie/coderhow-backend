import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// TODO 'validate'对dto进行校验
export class UserInfoDto {
	@IsNotEmpty()
	@ApiProperty({ name: 'username' })
	username: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'password' })
	password: string;
}
