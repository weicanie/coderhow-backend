import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireLogin, RequirePermission, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}
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

	@Get(':articleId')
	async getCommentCount(@Param('articleId') articleId: string) {
		return await this.commentService.getCommentCount(articleId);
	}

	@Patch(':commentId')
	@RequireLogin()
	@RequirePermission('comment')
	async modifyComment(@Param('commentId') commentId: string, @Body('content') content: string) {
		return await this.commentService.modifyComment(commentId, content);
	}

	@Delete(':commentId')
	@RequireLogin()
	@RequirePermission('comment')
	async removeComment(@Param('commentId') commentId: string) {
		return this.commentService.removeComment(commentId);
	}
}
