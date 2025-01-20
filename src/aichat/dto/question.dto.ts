import { ApiProperty } from '@nestjs/swagger';
export class QuestionDtoDto {
	@ApiProperty({ name: 'question' })
	question: string;
	@ApiProperty({ name: 'messages' })
	messages: string[];
}
