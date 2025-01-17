import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { DbService } from '../DB/db.service';
import { UserInfoFromToken } from '../types';
import { ConversationDto } from './dto/conversation.dto';
@Injectable()
export class AichatService {
	client: OpenAI;
	constructor(public dbService: DbService) {
		this.client = new OpenAI({
			apiKey: process.env.API_KEY,
			baseURL: 'https://api.chatanywhere.tech'
		});
	}

	async getSummaryFromAI(title: string, content: string) {
		try {
			const prompt = `
		给这篇文章写一下总结,要求分点、简明扼要。
		标题：${title}
		内容：${content}
		`;
			const response = await this.client.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: prompt }], //角色和提问内容
				max_tokens: 2000, // 答案长短
				n: 1 // 答案个数
			});
			return response.choices[0].message.content;
		} catch (error) {
			console.error('getAnswer error :', error);
		}
	}

	async getAnswerFromAI(question: string, messages: string[]) {
		// 限制上下文长度, 目前是字符串总长不能超过2500
		messages = this.sliceMessages(messages);
		// 上下文
		const totalMessages: Array<ChatCompletionMessageParam> = messages.map((message, index) =>
			index % 2 === 0 ? { role: 'user', content: message } : { role: 'assistant', content: message }
		);
		try {
			const prompt = `${question}`;
			totalMessages.push({ role: 'user', content: prompt });
			const response = await this.client.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: totalMessages, //提问的角色和内容
				max_tokens: 2000, // 答案长短
				n: 1 // 答案个数
			});
			// console.log(response.choices[0].message);
			return response.choices[0].message.content;
		} catch (error) {
			console.error('getAnswer error :', error);
		}
	}

	sliceMessages(messages: string[]) {
		if (messages.length <= 2) return messages;
		let topIndex: number;
		let strLenth: number;
		for (let i = messages.length - 1; i >= 0; i -= 2) {
			strLenth += messages[i].length + messages[i - 1].length;
			if (strLenth > 2500) {
				topIndex = i + 2;
				break;
			}
		}
		messages = messages.slice(topIndex);
		console.log('sliceMessages 超出指定长度,上下文已经进行截取,截取后的上下文:', messages);
		return messages;
	}

	async storeConversation(userInfo: UserInfoFromToken, conversationDto: ConversationDto) {
		const { userId } = userInfo;
		const { key, label } = conversationDto;
		let content = conversationDto.content;
		const values = await this.dbService
			.$queryRaw`SELECT * FROM ai_conversation WHERE keyname = ${key} AND user_id =${userId}`;
		// 初始化的空会话
		if (!values[0]?.content && content.length === 0) {
			const res = await this.dbService
				.$executeRaw`INSERT INTO ai_conversation (keyname, label, content, user_id) VALUE(${key}, ${label}, ${content}, ${userId})`;
			return res;
		}
		// 非初始化的空对话
		if (content.length === 0) {
			return '空对话,已忽略';
		}
		//判断会话数据是否已存在
		if (values[0]?.content) {
			//更新
			const res2 = await this.dbService
				.$executeRaw`UPDATE ai_conversation SET content = ${content} WHERE keyname = ${key}`;
			return res2;
		} else {
			//新增
			const res3 = await this.dbService
				.$executeRaw`INSERT INTO ai_conversation (keyname, label, content, user_id) VALUE(${key}, ${label}, ${content}, ${userId})`;
			return res3;
		}
	}

	async getConversationList(userInfo: UserInfoFromToken) {
		const { userId } = userInfo;
		const values = await this.dbService.$queryRaw`
		SELECT * FROM ai_conversation  WHERE user_id = ${userId}
		`;
		return values[0];
	}
}
