import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
	@ApiProperty({ name: 'content' })
	content: string;

	@ApiProperty({ name: 'id' })
	id: number;

	@ApiProperty({ name: 'user_id' })
	user_id: number;

	@ApiProperty({ name: 'create_at' })
	create_at: Date;

	@ApiProperty({ name: 'update_at' })
	update_at: Date | null;

	@ApiProperty({ name: 'article_id' })
	article_id: number;

	@ApiProperty({ name: 'comment_id' })
	comment_id: number | null;
}
