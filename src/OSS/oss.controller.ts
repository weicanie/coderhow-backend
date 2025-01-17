import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as Minio from 'minio';
@Controller('oss')
export class OssController {
	@Inject('OSS-CLIENT')
	private ossClient: Minio.Client;

	@Get('presignedUrl')
	async presignedPutObject(@Query('name') name: string) {
		return await this.ossClient.presignedPutObject('coderhow', name, 3600);
	}
}
