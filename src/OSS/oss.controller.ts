import { Controller, Get, HttpStatus, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RequireLogin } from '../decorator';
import { OssService } from './oss.service';
@Controller('oss')
export class OssController {
	constructor(private ossService: OssService) {}
	private logger = new Logger();
	@ApiOperation({ summary: 'get presignedURL of a object(file) to upload to OSS' })
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
	@ApiQuery({
		name: 'bucketName',
		type: String,
		required: false
	})
	@RequireLogin()
	@Get('presignedUrl')
	async presignedPutObject(
		@Query('name') name: string,
		@Query('bucketName') bucketName = 'coderhow'
	) {
		try {
			return await this.ossService.presignedPutObject(name, bucketName); // 桶名、对象名、预签名URL过期时间
		} catch (error) {
			this.logger.error(error, 'OssController ~ presignedPutObject');
		}
	}
}
