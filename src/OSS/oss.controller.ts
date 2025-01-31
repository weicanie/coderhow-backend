import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RequireLogin } from '../decorator';
import { OssService } from './oss.service';
@Controller('oss')
export class OssController {
	constructor(private ossService: OssService) {}
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
		name: 'name',
		type: String,
		required: true,
		example: 'mmk.png'
	})
	@ApiQuery({
		name: 'bucketName',
		type: String
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
			console.log('OssController ~ presignedPutObject ~ error:', error);
		}
	}
}
