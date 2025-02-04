import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WeiSum } from '../chat-history/chat-history.service';
import { DbService } from '../DB/db.service';
import { resBundle } from '../utils';

@Injectable()
export class ChatroomService {
	@Inject(DbService)
	private dbService: DbService;

	async createOneToOneChatroom(friendId: number, userId: number) {
		const { id } = await this.dbService.chatroom.create({
			data: {
				name: '聊天室' + Math.random().toString().slice(2, 8),
				type: false
			},
			select: {
				id: true
			}
		});
		//逻辑外键, 需要自己维护数据一致性和完整性
		await this.dbService.user_chatroom.create({
			data: {
				userId,
				chatroomId: id
			}
		});
		await this.dbService.user_chatroom.create({
			data: {
				userId: friendId,
				chatroomId: id
			}
		});
		return id; // 聊天室id
	}

	async createGroupChatroom(name: string, userId: number) {
		const { id } = await this.dbService.chatroom.create({
			data: {
				name,
				type: true
			}
		});
		await this.dbService.user_chatroom.create({
			data: {
				userId,
				chatroomId: id
			}
		});
		return id; // 聊天室id
	}
	async findgroup(name: string) {
		const rooms = await this.dbService.chatroom.findMany({
			where: {
				name: {
					contains: name
				}
			}
		});
		const trooms = rooms.map(room => ({
			group_id: room.id,
			avatar: '',
			number: 0,
			...rooms
		}));
		return resBundle(rooms);
	}
	async list(userId: number, name: string) {
		const chatroomIds = await this.dbService.user_chatroom.findMany({
			where: {
				userId
			},
			select: {
				chatroomId: true
			}
		});
		const chatrooms = await this.dbService.chatroom.findMany({
			where: {
				id: {
					in: chatroomIds.map(item => item.chatroomId)
				},
				name: {
					contains: name
				}
			},
			select: {
				id: true,
				name: true,
				type: true,
				create_at: true
			}
		});
		const res: WeiSum<
			WeiSum<
				(typeof chatrooms)[0],
				{ userIds: ReturnType<typeof this.dbService.user_chatroom.findMany> }
			>,
			{ userCount: number }
		>[] = [];
		for (let i = 0; i < chatrooms.length; i++) {
			const userIds = await this.dbService.user_chatroom.findMany({
				where: {
					chatroomId: chatrooms[i].id
				},
				select: {
					userId: true
				}
			});
			//类型为私聊
			if (chatrooms[i].type === false) {
				const user = await this.dbService.user.findUnique({
					where: {
						id: userIds.filter(item => item.userId !== userId)[0].userId //私聊房间就俩成员，获取对方的记录
					}
				});
				chatrooms[i].name = user.nickName;
			}
			res.push({
				...chatrooms[i],
				userCount: userIds.length,
				userIds: userIds.map(item => item.userId)
			});
		}

		return res;
	}

	async members(chatroomId: number) {
		const userIds = await this.dbService.user_chatroom.findMany({
			where: {
				chatroomId
			},
			select: {
				userId: true
			}
		});
		const rooms = await this.dbService.user.findMany({
			where: {
				id: {
					in: userIds.map(item => item.userId)
				}
			},
			select: {
				id: true,
				username: true,
				nickName: true,
				avatar_url: true,
				create_at: true,
				email: true
			}
		});
		return rooms;
	}

	async info(id: number) {
		const chatroom = await this.dbService.chatroom.findUnique({
			where: {
				id
			}
		});
		return { ...chatroom, rooms: await this.members(id) };
	}

	async join(id: number, username: string) {
		const chatroom = await this.dbService.chatroom.findUnique({
			where: {
				id
			}
		});

		if (chatroom.type === false) {
			throw new BadRequestException('一对一聊天室不能加人');
		}

		const user = await this.dbService.user.findUnique({
			where: {
				username
			}
		});

		if (!user) {
			throw new BadRequestException('用户不存在');
		}

		await this.dbService.user_chatroom.create({
			data: {
				userId: user.id,
				chatroomId: id
			}
		});

		return chatroom.id;
	}

	async quit(id: number, userId: number) {
		const chatroom = await this.dbService.chatroom.findUnique({
			where: {
				id
			}
		});
		//TODO 一对一聊天室退出
		if (chatroom.type === false) {
			throw new BadRequestException('一对一聊天室不能退出');
		}

		await this.dbService.user_chatroom.deleteMany({
			where: {
				userId,
				chatroomId: id
			}
		});

		return '退出成功';
	}

	async queryOneToOneChatroom(userId1: number, userId2: number) {
		const chatrooms = await this.dbService.user_chatroom.findMany({
			where: {
				userId: userId1
			}
		});
		const chatrooms2 = await this.dbService.user_chatroom.findMany({
			where: {
				userId: userId2
			}
		});

		let roomId: number;
		for (let i = 0; i < chatrooms.length; i++) {
			const chatroom = await this.dbService.chatroom.findFirst({
				where: {
					id: chatrooms[i].chatroomId
				}
			});
			if (chatroom.type === true) {
				continue;
			}

			const found = chatrooms2.find(item2 => item2.chatroomId === chatroom.id);
			if (found) {
				roomId = found.chatroomId;
				break;
			}
		}

		return roomId;
	}
}
