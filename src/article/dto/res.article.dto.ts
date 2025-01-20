export class ArticleResDto {
	content: string;
	id: number;
	user_id: number;
	create_at: Date | null;
	update_at: Date | null;
	title: string;
	ai_summary: string | null;
}
