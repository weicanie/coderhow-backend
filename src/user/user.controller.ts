import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireLogin, UserInfo } from '../decorator';
import { UserInfoFromToken } from '../types';
import { UserInfoDto } from './dto/user-info.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('commit')
	createUser(@Body() userInfo: UserInfoDto) {
		return this.userService.createUser(userInfo);
	}

	@Post('login')
	login(@Body() userInfo: UserInfoDto) {
		return this.userService.login(userInfo);
	}

	@RequireLogin()
	@Patch('uploadsign')
	uploadSign(@UserInfo() userInfo: UserInfoFromToken, @Body('sign') sign: string) {
		return this.userService.uploadSign(userInfo, sign);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.getUserInfo(id);
	}
}
