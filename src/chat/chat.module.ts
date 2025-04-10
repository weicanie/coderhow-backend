import { Module } from '@nestjs/common';
import { ChatHistoryModule } from 'src/chat-history/chat-history.module';
import { UserModule } from 'src/user/user.module';
import { AichatModule } from '../aichat/aichat.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
	imports: [ChatHistoryModule, UserModule, AichatModule],
	providers: [ChatGateway, ChatService]
})
export class ChatModule {}
