import { ApiProperty } from '@nestjs/swagger';

export class ArticleResDto {
	@ApiProperty({ name: 'content' })
	content: string;

	@ApiProperty({ name: 'id' })
	id: number;

	@ApiProperty({ name: 'user_id' })
	user_id: number;

	@ApiProperty({ name: 'create_at' })
	create_at: Date | null;

	@ApiProperty({ name: 'update_at' })
	update_at: Date | null;

	@ApiProperty({ name: 'title' })
	title: string;

	@ApiProperty({ name: 'ai_summary' })
	ai_summary: string | null;
}
