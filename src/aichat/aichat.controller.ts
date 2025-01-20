import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { AichatService } from './aichat.service';
import { ConversationDto } from './dto/conversation.dto';
import { QuestionDtoDto } from './dto/question.dto';
import { AiConversationDto } from './dto/res.aiconversation.dto';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}
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
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Number
	})
	@ApiBody({
		type: ConversationDto
	})
	@RequireLogin()
	@Post()
	async storeConversation(
		@UserInfo() userInfo: UserInfoFromToken,
		@Body() conversationDto: ConversationDto
	) {
		return await this.aichatService.storeConversation(userInfo, conversationDto);
	}
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Array<AiConversationDto>
	})
	@RequireLogin()
	@Get()
	async getConversationList(@UserInfo() userInfo: UserInfoFromToken) {
		return await this.aichatService.getConversationList(userInfo);
	}
}
const aaa = 123;
