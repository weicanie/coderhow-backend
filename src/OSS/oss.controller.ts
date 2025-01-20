import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import * as Minio from 'minio';
import { RequireLogin } from '../decorator';
@Controller('oss')
export class OssController {
	@Inject('OSS-CLIENT')
	private ossClient: Minio.Client;
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: String
	})
	@ApiQuery({
		name: 'name',
		type: String,
		required: true,
		example: 'mmk.png'
	})
	@RequireLogin()
	@Get('presignedUrl')
	async presignedPutObject(@Query('name') name: string) {
		return await this.ossClient.presignedPutObject('coderhow', name, 3600); // 桶名、对象名、预签名URL过期时间
	}
}
