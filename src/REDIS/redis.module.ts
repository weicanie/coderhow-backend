import { Global, Logger, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
@Global()
@Module({
	providers: [
		RedisService,
		{
			provide: 'REDIS_CLIENT',
			async useFactory() {
				const client = createClient({
					socket: {
						host: 'localhost',
						port: 6379
					},
					database: 1
				});
				const logger = new Logger();
				try {
					await client.connect();
					logger.log('redis数据库连接成功', 'RedisModule');
				} catch (error) {
					logger.error('redis数据库连接失败');
				}
				return client;
			}
		}
	],
	exports: [RedisService]
})
export class RedisModule {}
