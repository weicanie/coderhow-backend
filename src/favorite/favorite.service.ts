import { Inject, Injectable } from '@nestjs/common';
import { WeiSum } from '../chat-history/chat-history.service';
import { DbService } from '../DB/db.service';

@Injectable()
export class FavoriteService {
	@Inject(DbService)
	private dbService: DbService;

	async list(userId: number) {
		const favorites = await this.dbService.favorite.findMany({
			where: {
				userId
			}
		});
		const res: WeiSum<
			(typeof favorites)[0],
			WeiSum<
				{ chatRecord: ReturnType<typeof this.dbService.chatRecord.findUnique> },
				{ sender: ReturnType<typeof this.dbService.user.findUnique> }
			>
		>[] = [];
		for (let i = 0; i < favorites.length; i++) {
			const chatRecord = await this.dbService.chatRecord.findUnique({
				where: {
					id: favorites[i].chatRecordId
				}
			});
			const sender = await this.dbService.user.findUnique({
				where: {
					id: chatRecord.senderId
				}
			});
			Reflect.deleteProperty(sender, 'password');
			res.push({
				...favorites[i],
				chatRecord,
				sender
			});
		}
		return res;
	}

	async add(userId: number, chatRecordId: number) {
		return this.dbService.favorite.create({
			data: {
				userId,
				chatRecordId
			}
		});
	}

	async del(id: number) {
		return this.dbService.favorite.deleteMany({
			where: {
				id
			}
		});
	}
}
