import { Module } from '@nestjs/common';
import { AichatModule } from '../aichat/aichat.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
	imports: [AichatModule],
	controllers: [ArticleController],
	providers: [ArticleService]
})
export class ArticleModule {}
