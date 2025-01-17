import { Injectable } from '@nestjs/common';
import { AichatService } from '../aichat/aichat.service';
import { DbService } from '../DB/db.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class ArticleService {
	constructor(
		private aichatService: AichatService,
		private dbService: DbService,
		private tagService: TagService
	) {}
	async addArticle(title: string, content: string, userId: string, taglist: string[]) {
		//获取文章总结
		const summary = await this.aichatService.getSummaryFromAI(title, content);
		const article = await this.dbService.article.create({
			data: {
				title,
				content,
				user_id: +userId,
				ai_summary: summary ? summary : ''
			}
		});
		//添加标签
		this.tagService.addTagToArticle(String(article.id), taglist);
	}
	async removeArticle(articleId: string) {
		return await this.dbService.article.delete({
			where: {
				id: +articleId
			}
		});
	}

	async modifyArticle(articleId: string, content: string) {
		return await this.dbService.article.update({
			data: {
				content
			},
			where: {
				id: +articleId
			}
		});
	}
	async getArticleList(size = 5, offset = 0) {
		const statement = `
    SELECT 
      m.id id, m.title title, m.content content, m.ai_summary, m.create_at create_at, m.update_at update_at, 
      (
        SELECT JSON_OBJECT('user_id',u.id ,'username', u.username, 'avatar_url',u.avatar_url) 
        FROM user u 
        WHERE u.id = m.user_id
      ) author,
      JSON_ARRAYAGG(
        JSON_OBJECT(
					'id', c.id,
          'content', c.content, 'comment_id', c.comment_id,'judge', c.judge,'value',c.value,
          'user', 
            (
              SELECT JSON_OBJECT('user_id',u.id ,'username', u.username,'avatar_url',u.avatar_url) 
              FROM user u
              WHERE u.id = c.user_id
            )
        )
      ) comment,
      (
        SELECT JSON_ARRAYAGG(
        JSON_OBJECT('id',ai.id, 'filename', ai.filename,'mimetype', ai.mime_type) 
        ) imagelist
        FROM article n 
        LEFT JOIN article_image ai 
        ON n.id = ai.article_id
        GROUP BY n.id
        HAVING n.id = m.id
      ) imagelist,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('id', a_t.tag_id, 'content', t.content)) tags
        FROM article_tag a_t 
        LEFT JOIN tag t 
        ON t.id = a_t.tag_id
        WHERE a_t.article_id =  m.id
        GROUP BY a_t.article_id
      ) tag
    FROM article m 
    LEFT JOIN comment c ON m.id = c.article_id
    GROUP BY m.id
		LIMIT ${String(offset)}, ${String(size)}
    `;
		//offset用的是索引，不是'id'，索引从0开始
		//'id'可以当浮标，用来在即时通信中避免消息插入导致历史消息索引错位
		const values = await this.dbService.$queryRaw`${statement}`;
		return values;
	}

	async getArticleDetail(articleId: string) {
		//获取单篇文章及其评论列表、标签列表
		const statement = `
    SELECT 
      m.id id, m.title title, m.content content, m.ai_summary, m.create_at create_at, m.update_at update_at, 
      (
        SELECT JSON_OBJECT('user_id',u.id ,'username', u.username, 'avatar_url',u.avatar_url) 
        FROM user u 
        WHERE u.id = m.user_id
      ) author,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', c.id,
          'comment_content', c.content, 'comment_comment_id', c.comment_id,
					'judge', c.judge,'value',c.value,
          'user', 
            (
              SELECT JSON_OBJECT('user_id',u.id ,'username', u.username,'avatar_url',u.avatar_url) 
              FROM user u
              WHERE u.id = c.user_id
            )
        )
      ) comment,
      (
        SELECT JSON_ARRAYAGG(
        JSON_OBJECT('id',ai.id, 'filename', ai.filename,'mimetype', ai.mime_type) 
        ) imagelist
        FROM article n 
        LEFT JOIN article_image ai 
        ON n.id = ai.article_id
        GROUP BY n.id
        HAVING n.id = m.id
      ) imagelist,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('id', a_t.tag_id, 'content', t.content)) tags
        FROM article_tag a_t 
        LEFT JOIN tag t 
        ON t.id = a_t.tag_id
        WHERE a_t.article_id =  m.id
        GROUP BY a_t.article_id
      ) tag
    FROM article m 
    LEFT JOIN comment c ON m.id = c.article_id
    GROUP BY m.id
		HAVING m.id = ${articleId}
    `;
		try {
			const values = await this.dbService.$queryRaw`${statement}`;
			return values;
		} catch (error) {
			// TODO 数据库操作错误处理
			console.log(error);
		}
	}
}
