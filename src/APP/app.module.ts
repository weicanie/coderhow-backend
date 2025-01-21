import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AichatModule } from '../aichat/aichat.module';
import { ArticleModule } from '../article/article.module';
import { IsLoginGuard } from '../AUTH/is-login.guard';
import { CommentModule } from '../comment/comment.module';
import { DbModule } from '../DB/db.module';
import { FileModule } from '../file/file.module';
import { OssModule } from '../OSS/oss.module';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		DbModule,
		OssModule,
		AichatModule,
		ArticleModule,
		CommentModule,
		FileModule,
		TagModule,
		UserModule,
		JwtModule.registerAsync({
			global: true,
			useFactory() {
				return {
					signOptions: {}
				};
			}
		})
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: IsLoginGuard
		},
		{
			provide: APP_PIPE,
			useClass: ValidationPipe
		}
	]
})
export class AppModule {}
