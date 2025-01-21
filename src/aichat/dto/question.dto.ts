import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class QuestionDtoDto {
	@IsNotEmpty()
	@ApiProperty({ name: 'question' })
	question: string;

	@IsNotEmpty()
	@ApiProperty({ name: 'messages' })
	messages: string[];
}
