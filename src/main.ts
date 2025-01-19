import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './APP/app.module';
async function bootstrap() {
	dotenv.config();
	//TODO 开启跨域
	//TODO 前端大文件上传OSS
	//TODO docker版
	//TODO 整合chat后端
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
