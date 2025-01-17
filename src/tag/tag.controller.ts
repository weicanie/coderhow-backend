import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireLogin, RequirePermission } from '../decorator';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
	constructor(private readonly tagService: TagService) {}

	@Post()
	@RequireLogin()
	async addTag(@Body('content') content: string) {
		return await this.tagService.addTag(content);
	}

	@Get()
	async getTagList() {
		return await this.tagService.getTagList();
	}

	@Patch('/article/:articleId')
	@RequireLogin()
	@RequirePermission('article')
	async addTagToArticle(@Param('articleId') articleId: string, @Body('tag') taglist: string[]) {
		return await this.tagService.addTagToArticle(articleId, taglist);
	}

	@Delete('/article/:articleId/:tagId')
	@RequireLogin()
	@RequirePermission('article')
	async removeTagFromArticle(@Param('articleId') articleId: string, @Param('tagId') tagId: string) {
		return await this.tagService.removeTagFromArticle(tagId, articleId);
	}
}
