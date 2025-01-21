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
		return article;
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

	// FIXME 为什么参数没有转为number
	async getArticleList(page = 1, pageSize = 5) {
		const articleSelfs = await this.dbService.article.findMany({
			select: {
				id: true,
				title: true,
				content: true,
				ai_summary: true,
				create_at: true,
				update_at: true
			},
			skip: (page - 1) * pageSize,
			take: +pageSize
		});
		const articles = await this.dbService.article.findMany({
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar_url: true
					}
				},
				comment: {
					select: {
						id: true,
						content: true,
						comment_id: true,
						judge: true,
						value: true,
						user: {
							select: {
								id: true,
								username: true,
								avatar_url: true
							}
						}
					}
				},
				article_image: {
					select: {
						id: true,
						image_url: true
					}
				},
				article_tag: {
					select: {
						tag: {
							select: {
								id: true,
								content: true
							}
						}
					}
				}
			},
			skip: (page - 1) * pageSize,
			take: +pageSize
		});
		const transformedArticles = articles.map((article, index) => ({
			id: articleSelfs[index].id,
			title: articleSelfs[index].title,
			content: articleSelfs[index].content,
			ai_summary: articleSelfs[index].ai_summary,
			create_at: articleSelfs[index].create_at,
			update_at: articleSelfs[index].update_at,
			author: {
				user_id: article.user.id,
				username: article.user.username,
				avatar_url: article.user.avatar_url
			},
			comment: article.comment.map(comment => ({
				id: comment.id,
				content: comment.content,
				comment_id: comment.comment_id,
				judge: comment.judge,
				value: comment.value,
				user: {
					user_id: comment.user.id,
					username: comment.user.username,
					avatar_url: comment.user.avatar_url
				}
			})),
			imagelist: article.article_image.map(image => ({
				id: image.id,
				image_url: image.image_url
			})),
			tag: article.article_tag.map(articleTag => ({
				id: articleTag.tag.id,
				content: articleTag.tag.content
			}))
		}));

		return transformedArticles;
	}
	async getArticleDetail(articleId: string) {
		//获取单篇文章及其评论列表、标签列表
		const articleSelf = await this.dbService.article.findUnique({
			select: {
				id: true,
				title: true,
				content: true,
				ai_summary: true,
				create_at: true,
				update_at: true
			},
			where: {
				id: +articleId
			}
		});
		const article = await this.dbService.article.findUnique({
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar_url: true
					}
				},
				comment: {
					select: {
						id: true,
						content: true,
						comment_id: true,
						judge: true,
						value: true,
						user: {
							select: {
								id: true,
								username: true,
								avatar_url: true
							}
						}
					}
				},
				article_image: {
					select: {
						id: true,
						image_url: true
					}
				},
				article_tag: {
					select: {
						tag: {
							select: {
								id: true,
								content: true
							}
						}
					}
				}
			},
			where: {
				id: +articleId
			}
		});
		const transformedArticles = {
			id: articleSelf.id,
			title: articleSelf.title,
			content: articleSelf.content,
			ai_summary: articleSelf.ai_summary,
			create_at: articleSelf.create_at,
			update_at: articleSelf.update_at,
			author: {
				user_id: article.user.id,
				username: article.user.username,
				avatar_url: article.user.avatar_url
			},
			comment: article.comment.map(comment => ({
				id: comment.id,
				content: comment.content,
				comment_id: comment.comment_id,
				judge: comment.judge,
				value: comment.value,
				user: {
					user_id: comment.user.id,
					username: comment.user.username,
					avatar_url: comment.user.avatar_url
				}
			})),
			imagelist: article.article_image.map(image => ({
				id: image.id,
				image_url: image.image_url
			})),
			tag: article.article_tag.map(articleTag => ({
				id: articleTag.tag.id,
				content: articleTag.tag.content
			}))
		};

		return transformedArticles;
	}
	async getArticleList2(page = 0, pageSize = 5) {
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
        JSON_OBJECT('id',ai.id, 'image_url', ai.image_url) 
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
		LIMIT ${(page - 1) * pageSize}, ${pageSize}
    `;
		const values = await this.dbService.$queryRaw`${statement}`;
		return values;
	}
	async getArticleDetail2(articleId: string) {
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
		const values = await this.dbService.$queryRaw`${statement}`;
		return values;
	}
}
