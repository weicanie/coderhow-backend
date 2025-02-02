import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { RequireLogin, RequirePermission, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/res.comment.dto';
@ApiTags('评论')
@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}
	@ApiOperation({ summary: '评论评论' })
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
	async addChildComment(
		@Body('content') content: string,
		@Param('articleId') articleId: string,
		@Param('commentId') commentId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return await this.commentService.addComment(content, articleId, commentId, userInfo.userId);
	}
	@ApiOperation({ summary: '评论文章' })
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
	@Post(':articleId')
	@RequireLogin()
	async addComment(
		@Body('content') content: string,
		@Param('articleId') articleId: string,
		@UserInfo() userInfo: UserInfoFromToken
	) {
		return await this.commentService.addComment(content, articleId, '', userInfo.userId);
	}
	@ApiOperation({ summary: '获取文章评论详情' })
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
	async getCommentDetail(@Param('articleId') articleId: string) {
		return await this.commentService.getCommentDetail(articleId);
	}
	@ApiOperation({ summary: '修改评论' })
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
	@ApiOperation({ summary: '删除评论' })
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
