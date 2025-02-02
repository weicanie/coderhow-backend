import { Injectable } from '@nestjs/common';
import { DbService } from '../DB/db.service';
import { AichatService } from '../aichat/aichat.service';

@Injectable()
export class CommentService {
	constructor(
		private dbservice: DbService,
		private aichatService: AichatService
	) {}
	async addComment(content: string, articleId: string, commentId: string, userId: string) {
		// TODO (额外)不应该情感分析后才返回,会降低评论响应速度
		// 使用定时的批处理替代单次处理
		/* 		const prompt = `
		评论:${content}
		记这条评论为c
		1.给出c的情感激烈程度,
			返回数字代表c的情感激烈程度,
			1:平静;
			2:有点激烈;
			3:激烈;
			4:很激烈;
			5:歇斯底里;
		2.再给出c的情感倾向,是正面的还是负面的。
			返回数字,
			1:正面;
			0:负面;
			2:中立;比如如果c只是在提出问题,返回2
		答案只包含c的情感激烈程度数字a和c的情感倾向b,格式是"a,b"
		`;
		const emotionAns: string = await this.aichatService.getAnswerFromAI(prompt, []);
		const valueRes = emotionAns.match(/^\d(?=,)/g);
		const judgeRes = emotionAns.match(/(?<=,)\d$/g);
		const value = valueRes ? valueRes[0] : -1;
		const judge = judgeRes ? judgeRes[0] : -1; */
		const judge = -1;
		const value = -1;
		if (commentId) {
			//子评论
			return await this.dbservice.comment.create({
				data: {
					content,
					user_id: +userId,
					article_id: +articleId,
					comment_id: +commentId,
					judge: +judge,
					value: +value
				}
			});
		} else {
			//文章评论
			return await this.dbservice.comment.create({
				data: {
					content,
					user_id: +userId,
					article_id: +articleId,
					judge: +judge,
					value: +value
				}
			});
		}
	}

	async getCommentDetail(articleId: string) {
		const statement = `SELECT 
        m.id id, m.content content, m.create_at create_at, m.update_at update_at, 
        JSON_OBJECT('user_id',u.id, 'username', u.username) user,
        (SELECT COUNT(*) FROM comment WHERE comment.article_id = m.id) comment_count
      FROM article m LEFT JOIN user u ON m.user_id = u.id
      WHERE m.id = ${articleId}`;
		const values = await this.dbservice.$queryRaw`${statement}`;
		return values;
	}

	async removeComment(commentId: string) {
		return await this.dbservice.comment.delete({
			where: {
				id: +commentId
			}
		});
	}

	async modifyComment(commentId: string, content: string) {
		return await this.dbservice.comment.update({
			data: {
				content
			},
			where: {
				id: +commentId
			}
		});
	}
}
