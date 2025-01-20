import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../DB/db.service';

@Injectable()
export class TagService {
	constructor(public dbService: DbService) {}
	async addTag(content: string) {
		return await this.dbService.$executeRaw`INSERT INTO tag (content) VALUES (${content})`;
	}
	// 分页查询
	async getTagList(page: number, pageSize: number) {
		const values = this.dbService.tag.findMany({
			skip: (page - 1) * pageSize,
			take: pageSize
		});
		return values;
	}
	async addTagToArticle(articleId: string, taglist: string[]) {
		const readyTaglist = await this.checkAndMapTagList(taglist);
		const tagIdList = readyTaglist.map(item => item.id);
		const reslist: Array<{
			create_at: Date | null;
			update_at: Date | null;
			article_id: number;
			tag_id: number;
		}> = [];
		for (const tagId of tagIdList) {
			if (await this.tagIsOwned(articleId, tagId)) continue;
			try {
				const res = await this.dbService.article_tag.create({
					data: {
						article_id: +articleId,
						tag_id: tagId
					}
				});
				reslist.push(res);
			} catch (error) {
				throw new InternalServerErrorException(error);
			}
		}
		return reslist;
	}

	async removeTagFromArticle(tagId: string, articleId: string) {
		if (!(await this.tagIsOwned(articleId, tagId))) return;
		const statement = `DELETE FROM article_tag WHERE tag_id = ${tagId} AND article_id = ${articleId}`;
		return await this.dbService.$executeRaw`${statement}`;
	}

	async findTag(content: string) {
		const statement = `SELECT id,content FROM tag WHERE content = ${content}`;
		const values = await this.dbService.$queryRaw`${statement}`;
		return values[0];
	}

	async tagIsOwned(articleId: string, tagId: string) {
		//检查文章是否已经有该标签
		const statement = `SELECT * FROM article_tag WHERE article_id = ${articleId} AND tag_id=${tagId}`;
		const values = await this.dbService.$queryRaw`${statement}`;
		if (values === null) return false;
		return true;
	}
	async checkAndMapTagList(taglist: string[]) {
		//1. 查找TagList中有无新标签，有则新建
		//2. 把每个tag映射成content + id的形式
		// 没有标签的情况
		if (taglist.length === 0) return;
		const readyTaglist = [];
		for (const tagContent of taglist) {
			//标签是否存在
			const isDuplicated = await this.checkTagisDuplicated(tagContent);
			if (!isDuplicated) {
				await this.addTag(tagContent);
			}
			const tagFinded = await this.findTag(tagContent);
			readyTaglist.push(tagFinded);
		}
		return readyTaglist;
	}
	async checkTagisDuplicated(content: string) {
		const statement = `SELECT * FROM tag WHERE content = ${content}`;
		const values = await this.dbService.$queryRaw`${statement}`;
		if (!values[0]?.id) return false;
		return true;
	}
}
