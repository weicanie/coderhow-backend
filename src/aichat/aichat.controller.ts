import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { AichatService } from './aichat.service';
import { ConversationDto } from './dto/conversation.dto';
import { QuestionDtoDto } from './dto/question.dto';
import { AiConversationDto } from './dto/res.aiconversation.dto';
@ApiTags('AI助手')
@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}
	@ApiOperation({ summary: '获取答复' })
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
	@ApiOperation({ summary: '储存对话' })
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
	@ApiOperation({ summary: '获取对话列表' })
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
