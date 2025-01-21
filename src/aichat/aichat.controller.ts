import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { AichatService } from './aichat.service';
import { ConversationDto } from './dto/conversation.dto';
import { QuestionDtoDto } from './dto/question.dto';
import { AiConversationDto } from './dto/res.aiconversation.dto';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}
	@ApiOperation({ summary: 'getAnswer', description: 'getAnswer' })
	@ApiResponse({
		status: HttpStatus.OK,
		type: String
	})
	@ApiBody({
		type: QuestionDtoDto
	})
	@Post()
	async getAnswer(@Body() questionDtoDto: QuestionDtoDto) {
		const { question, messages } = questionDtoDto;
		return await this.aichatService.getAnswerFromAI(question, messages);
	}
	@ApiOperation({ summary: 'storeConversation', description: 'storeConversation' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Number
	})
	@ApiBody({
		type: ConversationDto
	})
	@RequireLogin()
	@Post('store')
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationDto
	) {
		return await this.aichatService.storeConversation(userInfo, conversationDto);
	}
	@ApiOperation({ summary: 'getConversationList', description: 'getConversationList' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: [AiConversationDto]
	})
	@RequireLogin()
	@Get()
	async getConversationList(@UserInfo() userInfo: UserInfoFromToken) {
		return await this.aichatService.getConversationList(userInfo);
	}
}
