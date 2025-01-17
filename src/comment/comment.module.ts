import { Module } from '@nestjs/common';
import { AichatModule } from '../aichat/aichat.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
	imports: [AichatModule],
	controllers: [CommentController],
	providers: [CommentService]
})
export class CommentModule {}
