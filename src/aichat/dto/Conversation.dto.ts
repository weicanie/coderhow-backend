import { ApiProperty } from '@nestjs/swagger';
// TODO 'validate'对dto进行校验、自动类型转换（number和string）客户端上传的number、服务器会拿到string!?
export class ConversationDto {
	@ApiProperty({ name: 'key' }) key: string;
	@ApiProperty({ name: 'label' })
	label: string;
	@ApiProperty({ name: 'content' })
	content: string[];
}
