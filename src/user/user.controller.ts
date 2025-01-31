import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { UserInfoResDto } from './dto/res.userInfo.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('commit')
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({
		description: 'User information for account creation',
		type: UserInfoDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: String
	})
	async createUser(@Body() userInfo: UserInfoDto) {
		return this.userService.createUser(userInfo);
	}

	@Post('login')
	@ApiOperation({ summary: 'User login' })
	@ApiBody({
		description: 'User login credentials',
		type: UserInfoDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserInfoResDto
	})
	async login(@Body() userInfo: UserInfoDto) {
		return this.userService.login(userInfo);
	}

	@RequireLogin()
	@Patch('uploadsign')
	@ApiOperation({ summary: 'Upload user signature' })
	@ApiBody({
		description: 'User signature to upload',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Number
	})
	async uploadSign(@UserInfo() userInfo: UserInfoFromToken, @Body('sign') sign: string) {
		return this.userService.uploadSign(userInfo, sign);
	}

	@RequireLogin()
	@Patch('upload-avatar')
	@ApiOperation({ summary: 'Upload user avatar' })
	@ApiQuery({
		name: 'name',
		description: 'name of file',
		type: String
	})
	@ApiQuery({
		name: 'bucketName',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: String
	})
	async uploadAvatar(
		@UserInfo() userInfo: UserInfoFromToken,
		@Query('name') name: string,
		@Query('bucketName') bucketName = 'coderhow'
	) {
		return this.userService.uploadAvatar(userInfo, name, bucketName);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user information by ID' })
	@ApiParam({
		name: 'id',
		description: 'ID of the user to retrieve information',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserInfoResDto
	})
	async getUserInfo(@Param('id') id: string) {
		return this.userService.getUserInfo(id);
	}
}
