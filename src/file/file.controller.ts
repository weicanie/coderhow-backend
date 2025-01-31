import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiParam, ApiResponse } from '@nestjs/swagger';
import { ImagesDto } from './dto/res.imges.dto';
import { FileService } from './file.service';
@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}
	@ApiResponse({
		status: HttpStatus.OK,
		type: String
	})
	@ApiParam({
		name: 'userId',
		type: String,
		required: true,
		example: '1'
	})
	@Get('avatar/:userId')
	async getAvatar(@Param('userId') userId: string) {
		return (await this.fileService.getAvatar(userId))?.avatar_url;
	}
	@ApiResponse({
		status: HttpStatus.OK,
		type: Array<ImagesDto>
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@Get('article-image/:articleId')
	async getImages(@Param('articleId') articleId: string) {
		return await this.fileService.getImage(articleId);
	}
}
