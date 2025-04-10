import { Module } from '@nestjs/common';
import { ChatHistoryModule } from '../chat-history/chat-history.module';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';

@Module({
	controllers: [ChatroomController],
	providers: [ChatroomService],
	imports: [ChatHistoryModule]
})
export class ChatroomModule {}
