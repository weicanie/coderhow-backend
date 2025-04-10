import { Inject } from '@nestjs/common';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';
import { AichatService } from '../aichat/aichat.service';
import { UserService } from './../user/user.service';
import { ChatService } from './chat.service';

interface JoinRoomPayload {
	chatroomId: number;
	userId: number;
}

interface SendMessagePayload {
	sendUserId: number;
	chatroomId: number;
	message: {
		type: 'text' | 'image' | 'file';
		content: string;
	};
}
const aiId = 4;

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
	@Inject(AichatService)
	aichatService: AichatService;
	constructor(private readonly chatService: ChatService) {}

	@WebSocketServer() server: Server;

	@SubscribeMessage('joinRoom')
	joinRoom(client: Socket, payload: JoinRoomPayload): void {
		const roomName = payload.chatroomId.toString();

		client.join(roomName);

		this.server.to(roomName).emit('message', {
			type: 'joinRoom',
			userId: payload.userId
		});
	}

	@Inject(ChatHistoryService)
	private chatRecordService: ChatHistoryService;

	@Inject(UserService)
	private userService: UserService;

	@SubscribeMessage('sendMessage')
	async sendMessage(@MessageBody() payload: SendMessagePayload) {
		const roomName = payload.chatroomId.toString();

		const map = {
			text: 0,
			image: 1,
			file: 2
		};
		const history = await this.chatRecordService.add(payload.chatroomId, {
			content: payload.message.content,
			type: map[payload.message.type],
			chatroomId: payload.chatroomId,
			senderId: payload.sendUserId
		});
		const sender = await this.userService.findUserDetailById(history.senderId);

		this.server.to(roomName).emit('message', {
			type: 'sendMessage',
			userId: payload.sendUserId,
			message: {
				...history,
				sender
			}
		});
		let contentSend = payload.message.content.trimEnd();
		if (!contentSend.endsWith('@ai')) return;
		contentSend = contentSend.slice(0, contentSend.length - 3);
		//* @ai 功能
		//TODO 上下文功能
		const answer = await this.aichatService.getAnswerFromAI(contentSend, []);

		const history2 = await this.chatRecordService.add(payload.chatroomId, {
			content: answer,
			type: map['text'],
			chatroomId: payload.chatroomId,
			senderId: aiId
		});
		const sender2 = await this.userService.findUserDetailById(history2.senderId);

		this.server.to(roomName).emit('message', {
			type: 'sendMessage',
			userId: aiId,
			message: {
				...history2,
				sender: sender2
			}
		});
	}
}
