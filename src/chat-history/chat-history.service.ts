import { Inject, Injectable } from '@nestjs/common';
import { chatRecord } from '@prisma/client';
import { DbService } from '../DB/db.service';

export type HistoryDto = Pick<chatRecord, 'chatroomId' | 'senderId' | 'type' | 'content'>;

interface Obj {
	[key: string]: any;
}
// 将两个对象的 keyof 结果( (联合类型1)|(联合类型2) )，利用extends分发特性形成一个联合类型(类型1|类型2|...)
type Flat<T> = T extends any ? T : never;
// 将两个对象类型合并成一个对象类型
export type WeiSum<T extends Obj, A extends Obj> = {
	[P in Flat<keyof T | keyof A>]: P extends keyof T ? T[P] : P extends keyof A ? A[P] : never;
};

@Injectable()
export class ChatHistoryService {
	@Inject(DbService)
	private dbService: DbService;

	async list(chatroomId: number) {
		const history = await this.dbService.chatRecord.findMany({
			where: {
				chatroomId
			}
		});
		//为每条消息查询发送者
		const res: WeiSum<(typeof history)[0], { sender: typeof this.dbService.user.findUnique }>[] =
			[];
		for (let i = 0; i < history.length; i++) {
			const user = await this.dbService.user.findUnique({
				where: {
					id: history[i].senderId
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true,
					create_at: true,
					avatar_url: true
				}
			});
			res.push({
				...history[i],
				sender: user
			});
		}
		return res;
	}
	//查询房间最后一条聊天信息
	async last(chatroomId: number) {
		const lastMessage = await this.dbService.chatRecord.findFirst({
			where: {
				chatroomId: chatroomId
			},
			orderBy: {
				create_at: 'desc' // 按创建时间降序排列
			}
		});
		//房间内没有消息
		if (lastMessage === null) return;
		const user = await this.dbService.user.findUnique({
			where: {
				id: lastMessage.senderId
			},
			select: {
				id: true,
				username: true,
				nickName: true,
				email: true,
				create_at: true,
				avatar_url: true
			}
		});
		// console.log('lastMessage', lastMessage);
		return { ...lastMessage, sender: user };
	}

	async add(chatroomId: number, history: HistoryDto) {
		return await this.dbService.chatRecord.create({
			data: history
		});
	}
}
