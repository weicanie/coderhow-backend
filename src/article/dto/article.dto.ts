import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ArticleDto {
	@ApiProperty({ name: 'title' })
	@IsNotEmpty()
	title: string;
	@ApiProperty({ name: 'content' })
	@IsNotEmpty()
	content: string;
	@ApiProperty({ name: 'tag' })
	@IsNotEmpty()
	tag: string[];
}
