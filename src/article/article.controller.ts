import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireLogin, RequirePermission, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { ArticleService } from './article.service';
import { ArticleDto } from './dto/article.dto';

@Controller('article')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@Post()
	@RequireLogin()
	async addArticle(@Body() articleDto: ArticleDto, @UserInfo() userInfo: UserInfoFromToken) {
		const { title, content, tag: taglist } = articleDto;
		const { userId } = userInfo;
		this.articleService.addArticle(title, content, userId, taglist);
	}
	@Get(`/:articleId`)
	@RequireLogin()
	@RequirePermission('article')
	async getArticleDetail(@Param('articleId') articleId: string) {
		this.articleService.getArticleDetail(articleId);
	}

	@Delete(`/:articleId`)
	@RequireLogin()
	@RequirePermission('article')
	async removeArticle(@Param('articleId') articleId: string) {
		this.articleService.removeArticle(articleId);
	}

	@Patch(`/:articleId`)
	@RequireLogin()
	@RequirePermission('article')
	async modifyArticle(@Param('articleId') articleId: string, @Body('content') content: string) {
		this.articleService.modifyArticle(articleId, content);
	}
}
