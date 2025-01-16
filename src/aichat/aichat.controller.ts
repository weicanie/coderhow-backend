import { Body, Controller, Get, Post } from '@nestjs/common';
import { AichatService } from './aichat.service';
import { ConversationDto } from './dto/Conversation.dto';
import { QuestionDtoDto } from './dto/question.dto';

@Controller('aichat')
export class AichatController {
	constructor(private readonly aichatService: AichatService) {}

	@Post()
	async getAnswer(@Body() questionDtoDto: QuestionDtoDto) {
		const { question, messages } = questionDtoDto;
		return await this.aichatService.getAnswerFromAI(question, messages);
	}
	//TODO auth guard
	//创建jwt鉴权的全局 guard 以及 标识handler需要登录的 decorator
	//鉴权通过后存储用户信息,并无感续用户token
	@Post()
	async storeConversation(@Body() conversationDto: ConversationDto) {}

	@Get()
	async getConversationList() {}
}
