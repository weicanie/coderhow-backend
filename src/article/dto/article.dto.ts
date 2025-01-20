import { ApiProperty } from '@nestjs/swagger';

export class ArticleDto {
	@ApiProperty({ name: 'title' })
	title: string;
	@ApiProperty({ name: 'content' })
	content: string;
	@ApiProperty({ name: 'tag' })
	tag: string[];
}
