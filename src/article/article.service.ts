import { Injectable } from '@nestjs/common';
import { AichatService } from '../aichat/aichat.service';
import { DbService } from '../DB/db.service';
import { TagService } from '../tag/tag.service';
import { OssService } from './../OSS/oss.service';

@Injectable()
export class ArticleService {
	constructor(
		private aichatService: AichatService,
		private dbService: DbService,
		private tagService: TagService,
		private ossService: OssService
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
	async uploadArticleImages(imageNames: string[], articleId: number, bucketName = 'coderhow') {
		const urls: string[] = [];
		for (let name of imageNames) {
			name = articleId + name;
			const url = await this.ossService.presignedPutObject(name);
			await this.dbService.article_image.create({
				data: {
					article_id: +articleId,
					image_url: `${process.env.OSS_SERVER_URL}/${bucketName}/${name}`
				}
			});
			urls.push(url);
		}
		return urls;
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
						article_id: true,
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
				article_id: comment.article_id,
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
		transformedArticles.forEach(transformedArticle => {
			if (!(transformedArticle.imagelist?.length > 0)) {
				transformedArticle.imagelist = [
					{
						id: -1,
						image_url: process.env.DEFAUT_IMGURL
					}
				];
			}
		});
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
						article_id: true,
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
		const transformedArticle = {
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
				article_id: comment.article_id,
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

		if (!(transformedArticle.imagelist?.length > 0)) {
			transformedArticle.imagelist = [
				{
					id: -1,
					image_url: process.env.DEFAUT_IMGURL
				}
			];
		}
		return transformedArticle;
	}
}
