import { Body, Controller, Get, Post } from '@nestjs/common';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { AichatService } from './aichat.service';
import { ConversationDto } from './dto/conversation.dto';
import { QuestionDtoDto } from './dto/question.dto';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}
	@Post()
	async getAnswer(@Body() questionDtoDto: QuestionDtoDto) {
		const { question, messages } = questionDtoDto;
		return await this.aichatService.getAnswerFromAI(question, messages);
	}

	@RequireLogin()
	@Post()
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationDto
	) {
		return await this.aichatService.storeConversation(userInfo, conversationDto);
	}

	@RequireLogin()
	@Get()
	async getConversationList(@UserInfo() userInfo: UserInfoFromToken) {
		return await this.aichatService.getConversationList(userInfo);
	}
}
