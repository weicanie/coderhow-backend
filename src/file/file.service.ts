import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { DbService } from '../DB/db.service';
@Injectable()
export class FileService {
	@Inject('OSS-CLIENT') OSSClient: Minio.Client;
	constructor(public dbService: DbService) {}
	async getAvatar(userId: string) {
		return await this.dbService.user.findUnique({
			select: {
				avatar_url: true
			},
			where: {
				id: +userId
			}
		});
	}
	async getImage(articleId: string) {
		return await this.dbService.article_image.findMany({
			select: {
				image_url: true
			},
			where: {
				article_id: +articleId
			}
		});
	}
}
