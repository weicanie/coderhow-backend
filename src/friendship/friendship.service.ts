import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WeiSum } from '../chat-history/chat-history.service';
import { DbService } from '../DB/db.service';
import { FriendAddDto } from './dto/friend-add.dto';
type FromUser = {
	create_at: Date;
	id: number;
	username: string;
	nickName: string;
	email: string;
	avatar_url: string;
};
type ToUser = {
	create_at: Date;
	id: number;
	username: string;
	nickName: string;
	email: string;
	avatar_url: string;
};
@Injectable()
export class FriendshipService {
	@Inject(DbService)
	private dbService: DbService;
	//发送好友请求
	async add(friendAddDto: FriendAddDto, userId: number) {
		const friend = await this.dbService.user.findUnique({
			where: {
				username: friendAddDto.username
			}
		});

		if (!friend) {
			throw new BadRequestException('要添加的 username 不存在');
		}

		if (friend.id === userId) {
			throw new BadRequestException('不能添加自己为好友');
		}
		const found = await this.dbService.friendship.findMany({
			where: {
				userId,
				friendId: friend.id
			}
		});

		if (found.length) {
			throw new BadRequestException('该好友已经添加过');
		}

		return await this.dbService.friendRequest.create({
			data: {
				from: userId,
				to: friend.id,
				reason: friendAddDto.reason,
				status: 0 //待定
			}
		});
	}
	//获取用户发送和接收到的好友请求
	async list(userId: number) {
		const fromMeRequest = await this.dbService.friendRequest.findMany({
			where: {
				from: userId
			}
		});

		const toMeRequest = await this.dbService.friendRequest.findMany({
			where: {
				to: userId
			}
		});
		const res: {
			toMe: WeiSum<
				(typeof toMeRequest)[0],
				{
					fromUser: FromUser;
				}
			>[];
			fromMe: WeiSum<
				(typeof toMeRequest)[0],
				{
					toUser: ToUser;
				}
			>[];
		} = {
			toMe: [],
			fromMe: []
		};

		for (let i = 0; i < fromMeRequest.length; i++) {
			const user = await this.dbService.user.findUnique({
				where: {
					id: fromMeRequest[i].to
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true,
					avatar_url: true,
					create_at: true
				}
			});
			res.fromMe.push({
				...fromMeRequest[i],
				toUser: user
			});
		}

		for (let i = 0; i < toMeRequest.length; i++) {
			const user = await this.dbService.user.findUnique({
				where: {
					id: toMeRequest[i].from
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true,
					avatar_url: true,
					create_at: true
				}
			});
			res.toMe.push({
				...toMeRequest[i],
				fromUser: user
			});
		}

		return res;
	}

	async agree(friendId: number, userId: number) {
		await this.dbService.friendRequest.updateMany({
			where: {
				from: friendId,
				to: userId,
				status: 0
			},
			data: {
				status: 1
			}
		});

		const res = await this.dbService.friendship.findMany({
			where: {
				userId,
				friendId
			}
		});

		if (!res.length) {
			await this.dbService.friendship.create({
				data: {
					userId,
					friendId
				}
			});
		}
		return '添加成功';
	}

	async reject(friendId: number, userId: number) {
		await this.dbService.friendRequest.updateMany({
			where: {
				from: friendId,
				to: userId,
				status: 0
			},
			data: {
				status: 2
			}
		});
		return '已拒绝';
	}
	//获取用户的所有好友
	async getFriendship(userId: number, name: string) {
		const friends = await this.dbService.friendship.findMany({
			where: {
				//同意好友请求时,只添加一个方向的二元组
				OR: [
					{
						userId: userId
					},
					{
						friendId: userId
					}
				]
			}
		});

		const set = new Set<number>();
		for (let i = 0; i < friends.length; i++) {
			set.add(friends[i].userId);
			set.add(friends[i].friendId);
		}

		const friendIds = [...set].filter(item => item !== userId);

		const res: {
			id: number;
			username: string;
			nickName: string;
			email: string;
		}[] = [];

		for (let i = 0; i < friendIds.length; i++) {
			const user = await this.dbService.user.findUnique({
				where: {
					id: friendIds[i]
				},
				select: {
					id: true,
					username: true,
					nickName: true,
					email: true
				}
			});
			res.push(user);
		}

		return res.filter((item: { id: number; username: string; nickName: string; email: string }) =>
			item.nickName.includes(name)
		);
	}
	async remove(friendId: number, userId: number) {
		await this.dbService.friendship.deleteMany({
			where: {
				//同意好友请求时,只添加一个方向的二元组
				OR: [
					{
						userId,
						friendId
					},
					{
						friendId: userId,
						userId: friendId
					}
				]
			}
		});
		return '删除成功';
	}
}
