import { Controller, Post } from '@nestjs/common';
import { RequireLogin } from '../decorator';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}
	@RequireLogin()
	@Post()
	async addArticle() {}
}
