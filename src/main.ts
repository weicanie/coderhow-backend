import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './APP/app.module';
async function bootstrap() {
	dotenv.config();
	//TODO app.enableCors();默认全接受？
	//TODO docker版
	//TODO 整合chat后端
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	// app.useGlobalPipes(new ValidationPipe({ transform: true }));
	const config = new DocumentBuilder()
		.setTitle('chathub backend 接口文档')
		.setDescription('chathub backend 接口文档')
		.setVersion('1.0')
		.addBearerAuth({
			type: 'http',
			description: 'jwt token',
			name: 'bearer'
		})
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('doc', app, document);
	await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
