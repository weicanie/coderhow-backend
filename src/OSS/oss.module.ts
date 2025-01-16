import { Global, Module } from '@nestjs/common';
import * as Minio from 'minio';
import { OssController } from './oss.controller';

@Global()
@Module({
	controllers: [OssController],
	providers: [
		{
			provide: 'OSS-CLIENT',
			async useFactory() {
				const client = await new Minio.Client({
					endPoint: 'localhost',
					port: 9000,
					useSSL: false,
					accessKey: process.env.ACCESSKEY,
					secretKey: process.env.SECRETKEY
				});
				return client;
			}
		}
	],
	exports: ['OSS-CLIENT']
})
export class OssModule {}
