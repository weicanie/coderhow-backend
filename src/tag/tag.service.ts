import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../DB/db.service';

@Injectable()
export class TagService {
	constructor(public dbService: DbService) {}
	async addTag(content: string) {
		return await this.dbService.tag.create({
			data: {
				content
			}
		});
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
		// FIXME delete竟然会报错
		return await this.dbService.article_tag.deleteMany({
			where: {
				tag_id: +tagId,
				article_id: +articleId
			}
		});
	}

	async findTag(content: string) {
		const value = await this.dbService.tag.findUnique({
			where: {
				content
			},
			select: {
				id: true,
				content: true
			}
		});
		return value;
	}

	async tagIsOwned(articleId: string, tagId: string) {
		//检查文章是否已经有该标签
		const result = await this.dbService.article_tag.findFirst({
			where: {
				article_id: +articleId,
				tag_id: +tagId
			}
		});
		if (result === null) return false;
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
		const values = await this.dbService.tag.findUnique({
			where: {
				content
			}
		});
		if (values?.id) return true;
		return false;
	}
}
