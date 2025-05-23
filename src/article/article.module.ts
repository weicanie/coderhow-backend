import { Module } from '@nestjs/common';
import { AichatModule } from '../aichat/aichat.module';
import { TagModule } from '../tag/tag.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
	imports: [AichatModule, TagModule],
	controllers: [ArticleController],
	providers: [ArticleService]
})
export class ArticleModule {}
