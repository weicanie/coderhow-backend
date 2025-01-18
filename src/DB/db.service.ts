import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			log: [
				{
					emit: 'stdout',
					level: 'query'
				}
			]
		});
	}

	async onModuleInit() {
		try {
			await this.$connect();
			console.log('连接成功');
		} catch (error) {
			console.log('连接失败', error);
		}
	}
}
