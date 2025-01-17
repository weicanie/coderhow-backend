import { Controller, Get, Param } from '@nestjs/common';
import { FileService } from './file.service';
//TODO 路由已变，改前端
//TODO 前端改为直传OSS (article_image表改为只提供URL)
@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Get('avatar/:userId')
	async getAvatar(@Param('userId') userId: string) {
		return await this.fileService.getAvatar(userId);
	}

	@Get('article-image/:articleId')
	async getImages(@Param('articleId') articleId: string) {
		return await this.fileService.getImage(articleId);
	}
}
