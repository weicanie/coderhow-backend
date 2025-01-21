import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
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
