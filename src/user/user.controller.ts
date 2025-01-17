import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserInfo } from './dto/user-info.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('commit')
	createUser(@Body() userInfo: UserInfo) {
		return this.userService.createUser(userInfo);
	}

	@Post('login')
	login(@Body() userInfo: UserInfo) {
		return this.userService.login(userInfo);
	}

	@Patch('uploadsign')
	uploadSign() {
		//TODO uploadSign
		// return this.userService.uploadSign();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.getUserInfo(id);
	}
}
