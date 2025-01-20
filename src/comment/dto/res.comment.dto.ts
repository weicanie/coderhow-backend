export class CommentDto {
	content: string;
	id: number;
	user_id: number;
	create_at: Date;
	update_at: Date | null;
	article_id: number;
	comment_id: number | null;
	judge: number;
	value: number;
}
