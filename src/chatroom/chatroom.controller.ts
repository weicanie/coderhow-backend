import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserInfo } from '../decorator';
import { ChatroomService } from './chatroom.service';
@Controller('chatroom')
export class ChatroomController {
	constructor(private readonly chatroomService: ChatroomService) {}
	@ApiOperation({ summary: 'create one-to-one chatroom ' })
	@Get('create-one-to-one')
	@ApiQuery({ name: 'friendId', required: true })
	@ApiResponse({ status: 200, description: 'One-to-one chatroom created successfully' })
	async oneToOne(@Query('friendId') friendId: number, @UserInfo('userId') userId: number) {
		if (!friendId) {
			throw new BadRequestException('聊天好友的 id 不能为空');
		}
		return await this.chatroomService.createOneToOneChatroom(friendId, userId);
	}
	@ApiOperation({ summary: 'create group chatroom ' })
	@Get('create-group')
	@ApiQuery({ name: 'name', required: true })
	@ApiResponse({ status: 200, description: 'Group chatroom created successfully' })
	async group(@Query('name') name: string, @UserInfo('userId') userId: number) {
		return await this.chatroomService.createGroupChatroom(name, userId);
	}
	@ApiOperation({ summary: 'get chatroom list of user ' })
	@Get('list')
	@ApiQuery({ name: 'name', required: false })
	@ApiResponse({ status: 200, description: 'Chatroom list retrieved successfully' })
	async list(@UserInfo('userId') userId: number, @Query('name') name: string) {
		if (!userId) {
			throw new BadRequestException('userId 不能为空');
		}
		return await this.chatroomService.list(userId, name);
	}
	@ApiOperation({ summary: 'get members of group chatroom ' })
	@Get('members')
	@ApiQuery({ name: 'chatroomId', required: true })
	@ApiResponse({ status: 200, description: 'Chatroom members retrieved successfully' })
	async members(@Query('chatroomId') chatroomId: number) {
		if (!chatroomId) {
			throw new BadRequestException('chatroomId 不能为空');
		}
		return await this.chatroomService.members(chatroomId);
	}
	@ApiOperation({ summary: 'get info of chatroom ' })
	@Get('info/:id')
	@ApiParam({ name: 'id', required: true })
	@ApiResponse({ status: 200, description: 'Chatroom info retrieved successfully' })
	async info(@Param('id') id: number) {
		if (!id) {
			throw new BadRequestException('id 不能为空');
		}
		return await this.chatroomService.info(id);
	}
	@ApiOperation({ summary: 'user join in chatroom ' })
	@Get('join/:id')
	@ApiParam({ name: 'id', required: true })
	@ApiQuery({ name: 'joinUsername', required: true })
	@ApiResponse({ status: 200, description: 'Joined chatroom successfully' })
	async join(@Param('id') id: number, @Query('joinUsername') joinUsername: string) {
		if (!id) {
			throw new BadRequestException('id 不能为空');
		}
		if (!joinUsername) {
			throw new BadRequestException('joinUsername 不能为空');
		}
		return await this.chatroomService.join(id, joinUsername);
	}
	@ApiOperation({ summary: 'user quit from chatroom ' })
	@Get('quit/:id')
	@ApiParam({ name: 'id', required: true })
	@ApiQuery({ name: 'quitUserId', required: true })
	@ApiResponse({ status: 200, description: 'Quit chatroom successfully' })
	async quit(@Param('id') id: number, @Query('quitUserId') quitUserId: number) {
		if (!id) {
			throw new BadRequestException('id 不能为空');
		}
		if (!quitUserId) {
			throw new BadRequestException('quitUserId 不能为空');
		}
		return await this.chatroomService.quit(id, quitUserId);
	}
	@ApiOperation({ summary: 'user query chatroom by name (contain) ' })
	@Get('findChatroom')
	@ApiQuery({ name: 'userId1', required: true })
	@ApiQuery({ name: 'userId2', required: true })
	@ApiResponse({ status: 200, description: 'Chatroom found successfully' })
	async findChatroom(@Query('userId1') userId1: string, @Query('userId2') userId2: string) {
		if (!userId1 || !userId2) {
			throw new BadRequestException('用户 id 不能为空');
		}
		return await this.chatroomService.queryOneToOneChatroom(+userId1, +userId2);
	}
}
