import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AichatModule } from '../aichat/aichat.module';
import { ArticleModule } from '../article/article.module';
import { IsLoginGuard } from '../AUTH/is-login.guard';
import { ChatHistoryModule } from '../chat-history/chat-history.module';
import { ChatModule } from '../chat/chat.module';
import { ChatroomModule } from '../chatroom/chatroom.module';
import { CommentModule } from '../comment/comment.module';
import { DbModule } from '../DB/db.module';
import { EmailModule } from '../email/email.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { FileModule } from '../file/file.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { OssModule } from '../OSS/oss.module';
import { RedisModule } from '../REDIS/redis.module';
import { TagModule } from '../tag/tag.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		DbModule,
		OssModule,
		RedisModule,
		EmailModule,
		AichatModule,
		ArticleModule,
		CommentModule,
		FileModule,
		TagModule,
		FriendshipModule,
		ChatroomModule,
		ChatModule,
		ChatHistoryModule,
		FavoriteModule,
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
		// {
		// 	provide: APP_PIPE,
		// 	useFactory() {
		// 		return new ValidationPipe({ transform: true });
		// 	}
		// }
	]
})
export class AppModule {}
