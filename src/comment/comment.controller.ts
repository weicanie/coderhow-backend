import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, RequirePermission, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/res.comment.dto';

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: CommentDto
	})
	@ApiBody({
		type: String
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@ApiParam({
		name: 'commentId',
		type: String,
		required: true,
		example: '1'
	})
	@Post(':articleId/:commentId')
	@RequireLogin()
	async addComment(
		@Body('content') content: string,
		@Param('articleId') articleId: string,
		@Param('commentId') commentId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return await this.commentService.addComment(content, articleId, commentId, userInfo.userId);
	}
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
	@Get(':articleId')
	async getCommentCount(@Param('articleId') articleId: string) {
		return await this.commentService.getCommentCount(articleId);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: CommentDto
	})
	@ApiBody({
		type: String
	})
	@ApiParam({
		name: 'commentId',
		type: String,
		required: true,
		example: '1'
	})
	@Patch(':commentId')
	@RequireLogin()
	@RequirePermission('comment')
	async modifyComment(@Param('commentId') commentId: string, @Body('content') content: string) {
		return await this.commentService.modifyComment(commentId, content);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: CommentDto
	})
	@ApiParam({
		name: 'commentId',
		type: String,
		required: true,
		example: '1'
	})
	@Delete(':commentId')
	@RequireLogin()
	@RequirePermission('comment')
	async removeComment(@Param('commentId') commentId: string) {
		return this.commentService.removeComment(commentId);
	}
}
