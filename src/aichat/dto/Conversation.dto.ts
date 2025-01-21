import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
// TODO 'validate'对dto进行校验、自动类型转换（number和string）客户端上传的number、服务器会拿到string!?
export class ConversationDto {
	@IsNotEmpty()
	@ApiProperty({ name: 'key' })
	key: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'label' })
	label: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'content' })
	content: string[];
}
