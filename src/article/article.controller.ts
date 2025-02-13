import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, RequirePermission, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { ArticleService } from './article.service';
import { ArticleDto } from './dto/article.dto';
import { ArticleResDto } from './dto/res.article.dto';

@Controller('article')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: ArticleResDto
	})
	@ApiBody({
		type: ArticleDto
	})
	@Post()
	@RequireLogin()
	async addArticle(@Body() articleDto: ArticleDto, @UserInfo() userInfo: UserInfoFromToken) {
		const { title, content, tag: taglist } = articleDto;
		const { userId } = userInfo;
		return await this.articleService.addArticle(title, content, userId, taglist);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Object
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@Get(`/:articleId`)
	async getArticleDetail(@Param('articleId') articleId: string) {
		return await this.articleService.getArticleDetail(articleId);
	}
	@ApiResponse({
		status: HttpStatus.OK,
		type: Object
	})
	@ApiParam({
		name: 'page',
		type: Number,
		required: true,
		example: '1'
	})
	@ApiParam({
		name: 'pageSize',
		type: Number,
		required: true,
		example: '1'
	})
	@Get(`/:page/:pageSize`)
	async getArticleList(
		@Param('page', ParseIntPipe) page: number,
		@Param('pageSize', ParseIntPipe) pageSize: number
	) {
		return await this.articleService.getArticleList(page, pageSize);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: ArticleResDto
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@Delete(`/:articleId`)
	@RequireLogin()
	@RequirePermission('article')
	async removeArticle(@Param('articleId') articleId: string) {
		return await this.articleService.removeArticle(articleId);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: ArticleResDto
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@Patch(`/:articleId`)
	@RequireLogin()
	@RequirePermission('article')
	async modifyArticle(@Param('articleId') articleId: string, @Body('content') content: string) {
		return await this.articleService.modifyArticle(articleId, content);
	}
}
