import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ChatHistoryService } from './chat-history.service';
@Controller('chat-history')
export class ChatHistoryController {
	constructor(private readonly chatRecordService: ChatHistoryService) {}
	@ApiOperation({ summary: 'get chat history list of chatroom' })
	@ApiResponse({
		status: 200,
		type: Object,
		isArray: true
	})
	@ApiQuery({
		name: 'chatroomId',
		type: String,
		required: true,
		example: '1'
	})
	@Get('list')
	async list(@Query('chatroomId') chatroomId: string) {
		return this.chatRecordService.list(+chatroomId);
	}
}
