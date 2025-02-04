import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
export class ConversationDto {
	@IsNotEmpty()
	@ApiProperty({ name: 'key' })
	@Type(() => String)
	key: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'label' })
	label: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'content' })
	content: string[];
}
