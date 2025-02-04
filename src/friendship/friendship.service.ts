import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { WeiSum } from '../chat-history/chat-history.service';
import { DbService } from '../DB/db.service';
import { resBundle } from '../utils';
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
type FirendRequestList<T1, T2> = {
	toMe: WeiSum<
		T1,
		{
			fromUser: FromUser;
		}
	>[];
	fromMe: WeiSum<
		T2,
		{
			toUser: ToUser;
		}
	>[];
};
type GroupFriendlist<T> = {
	name: string;
	online_counts: number;
	friend: T;
};
// TODO 用户自定义分组功能
// 重新设计表, 用户-->好友组-->好友
// TODO 其它CRUD功能,如好友备注
enum friendGroupName {
	default = '我的好友',
	friend = '朋友',
	family = '家人',
	schoolmate = '同学',
	favorite = '特别关心'
}
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
		// TODO 先直接添加成功
		await this.dbService.friendship.create({
			data: {
				userId,
				friendId: friend.id
			}
		});
		await this.dbService.friendGroup.create({
			data: {
				userId,
				friendId: friend.id,
				name: friendGroupName.default
			}
		});
		await this.dbService.friendGroup.create({
			data: {
				userId: friend.id,
				friendId: userId,
				name: friendGroupName.default
			}
		});
		await this.dbService.friendRequest.create({
			data: {
				from: userId,
				to: friend.id,
				reason: friendAddDto.reason,
				status: 0 //待定
			}
		});
		return resBundle<string>('好友添加成功');
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
		const res: FirendRequestList<(typeof toMeRequest)[0], (typeof toMeRequest)[0]> = {
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
	async getFriendlist(userId: number) {
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

		const friendlist: {
			id: number;
			username: string;
			nickName: string;
			email: string;
			group: string;
			online_status: string;
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
					email: true,
					online_status: true
				}
			});
			const group = await this.dbService.friendGroup.findMany({
				where: {
					userId,
					friendId: user.id
				},
				select: {
					name: true
				}
			});
			friendlist.push({ ...user, group: group[0].name });
		}
		const tFriendlist: GroupFriendlist<typeof friendlist>[] = [];
		const groups = [
			friendGroupName.default,
			friendGroupName.family,
			friendGroupName.favorite,
			friendGroupName.friend,
			friendGroupName.schoolmate
		];
		for (let group of groups) {
			const groupFriendlist = friendlist.filter(friend => friend.group === group);
			tFriendlist.push({
				name: friendGroupName.default,
				online_counts: groupFriendlist.filter(friend => friend.online_status === 'online').length,
				friend: groupFriendlist
			});
		}
		return tFriendlist;
	}
	async getFriend(userId: number, name: string) {
		const friendId = await this.dbService.user.findUnique({
			where: {
				username: name
			},
			select: {
				id: true
			}
		});
		const group = await this.dbService.friendGroup.findFirst({
			where: {
				userId,
				friendId: friendId.id
			},
			select: {
				name: true
			}
		});
		const tFriendlist = await this.getFriendlist(userId);
		const groupFriendlist = tFriendlist.filter(
			groupFriendlist => groupFriendlist.name === group.name
		);
		const friend = groupFriendlist[0].friend.filter(
			friend => friend.nickName === name || friend.username === name
		);

		return resBundle<(typeof friend)[0]>(friend[0]);
	}
	async getFriendById(userId: number, name: string) {
		const friendInfo = await this.dbService.user.findUnique({
			where: {
				username: name
			},
			select: {
				id: true,
				avatar_url: true,
				sign: true
			}
		});
		const group = await this.dbService.friendGroup.findFirst({
			where: {
				userId,
				friendId: friendInfo.id
			},
			select: {
				name: true
			}
		});
		const tFriendlist = await this.getFriendlist(userId);
		const groupFriendlist = tFriendlist.filter(
			groupFriendlist => groupFriendlist.name === group.name
		);
		const friend = groupFriendlist[0].friend.filter(
			friend => friend.nickName === name || friend.username === name
		);
		const tFriend = {
			...friend[0],
			avatar: friendInfo.avatar_url,
			signature: friendInfo.sign
		};
		return resBundle<typeof tFriend>(tFriend);
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
