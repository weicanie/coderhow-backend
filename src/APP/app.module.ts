import { Module } from '@nestjs/common';
import { AichatModule } from '../aichat/aichat.module';
import { ArticleModule } from '../article/article.module';
import { CommentModule } from '../comment/comment.module';
import { DbModule } from '../DB/db.module';
import { FileModule } from '../file/file.module';
import { LoginModule } from '../login/login.module';
import { OssModule } from '../OSS/oss.module';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		AichatModule,
		ArticleModule,
		CommentModule,
		FileModule,
		LoginModule,
		TagModule,
		UserModule,
		DbModule,
		OssModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
