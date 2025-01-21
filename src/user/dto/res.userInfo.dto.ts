import { ApiProperty } from '@nestjs/swagger';
// a O<Esc>"fpdiw"epjl"fyiwkf'ci'<Esc>"fpjj^
export class UserInfoResDto {
	@ApiProperty({ name: 'token' })
	token: string;

	@ApiProperty({ name: 'id' })
	id: number;

	@ApiProperty({ name: 'username' })
	username: string;

	@ApiProperty({ name: 'avatar_url' })
	avatar_url: string;

	@ApiProperty({ name: 'create_at' })
	create_at: Date;

	@ApiProperty({ name: 'update_at' })
	update_at: Date;

	@ApiProperty({ name: 'sign' })
	sign: string;
}
