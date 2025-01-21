import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { UserInfoDto } from './dto/user-info.dto';
import { UserService } from './user.service';

@Controller('users')
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
		type: Number
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
		type: () =>
			new (class {
				userId: number;
				username: string;
				token: string;
				avatar_url: string;
			})()
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

	@Get(':id')
	@ApiOperation({ summary: 'Get user information by ID' })
	@ApiParam({
		name: 'id',
		description: 'ID of the user to retrieve information',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: () =>
			new (class {
				id: number;
				username: string;
				avatar_url: string | null;
				create_at: Date | null;
				update_at: Date | null;
				sign: string | null;
			})()
	})
	async getUserInfo(@Param('id') id: string) {
		return this.userService.getUserInfo(id);
	}
}
