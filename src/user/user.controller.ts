import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Inject,
	Param,
	Patch,
	Post,
	Query
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse
} from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { EmailService } from '../email/email.service';
import { RedisService } from '../REDIS/redis.service';
import { UserInfoFromToken } from '../types';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserInfoResDto } from './dto/res.userInfo.dto';
import { UpdateUserEmailDto } from './dto/update-user-email.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}
	@Inject(EmailService)
	private emailService: EmailService;
	@Inject(JwtService)
	private jwtService: JwtService;
	@Inject(RedisService)
	private redisService: RedisService;
	//新增接口
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({
		description: 'User information for account creation',
		type: RegisterUserDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: RegisterUserDto
	})
	@Post('regist')
	async regist(@Body() registerUser: RegisterUserDto) {
		return await this.userService.regist(registerUser);
	}
	@ApiQuery({
		name: 'address',
		description: 'Email address to send the captcha',
		required: true,
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Captcha sent successfully'
	})
	@Get('register-captcha')
	async captcha(@Query('address') address: string) {
		if (!address) {
			throw new BadRequestException('邮箱地址不能为空');
		}
		const code = Math.random().toString().slice(2, 8);

		await this.redisService.set(`captcha_${address}`, code, 5 * 60);

		await this.emailService.sendMail({
			to: address,
			subject: '注册验证码',
			html: `<p>你的注册验证码是 ${code}</p>`
		});
		return '发送成功';
	}

	@ApiOperation({ summary: 'User login' })
	@ApiBody({
		description: 'User login information',
		type: LoginUserDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserInfoResDto
	})
	@Post('login')
	async login(@Body() loginUser: LoginUserDto) {
		return await this.userService.login(loginUser);
	}
	@ApiOperation({ summary: 'User logout' })
	@ApiBody({
		description: 'User login information',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserInfoResDto
	})
	@Post('logout')
	async logout(@Body('username') username: string) {
		return await this.userService.logout(username);
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
	async getInfoById(@Param('id') userId: number) {
		return this.userService.findUserDetailById(userId);
	}
	@Get()
	@ApiOperation({ summary: 'Get user information by username', description: '使用模糊搜索' })
	@ApiQuery({
		name: 'username',
		description: 'username of the user to retrieve information',
		type: String
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserInfoResDto
	})
	async getInfoByName(@Query('username') username: string) {
		return this.userService.findUserDetailByName(username);
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
	@ApiBearerAuth('bearer')
	@ApiOperation({ summary: 'Update user password' })
	@ApiBody({
		description: 'User password update information',
		type: UpdateUserPasswordDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Password updated successfully'
	})
	@Post('update_password')
	async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
		return this.userService.updatePassword(passwordDto);
	}

	@Get('update_password/captcha')
	@RequireLogin()
	async updatePasswordCaptcha(@Query('address') address: string) {
		if (!address) {
			throw new BadRequestException('邮箱地址不能为空');
		}
		const code = Math.random().toString().slice(2, 8);

		await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);

		await this.emailService.sendMail({
			to: address,
			subject: '更改密码验证码',
			html: `<p>你的更改密码验证码是 ${code}</p>`
		});
		return '发送成功';
	}
	// TODO 测试更新邮箱接口
	@ApiBearerAuth('bearer')
	@ApiOperation({ summary: 'Update user email' })
	@ApiBody({
		description: 'User email update information',
		type: UpdateUserEmailDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Email updated successfully'
	})
	@Post('update_email')
	@RequireLogin()
	async updateEmail(@Body() passwordDto: UpdateUserEmailDto, @UserInfo('userId') userId: number) {
		return this.userService.updateEmail(userId, passwordDto);
	}

	@Get('update_email/captcha')
	async updateEmailCaptcha(@Query('address') address: string) {
		if (!address) {
			throw new BadRequestException('邮箱地址不能为空');
		}
		const code = Math.random().toString().slice(2, 8);

		await this.redisService.set(`update_password_email_${address}`, code, 10 * 60);

		await this.emailService.sendMail({
			to: address,
			subject: '更改邮箱验证码',
			html: `<p>你的更改邮箱验证码是 ${code}</p>`
		});
		return '发送成功';
	}
	//更新密码和邮箱外的信息
	@ApiBearerAuth('bearer')
	@ApiOperation({ summary: 'Update user information' })
	@ApiBody({
		description: 'User information update',
		type: UpdateUserDto
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User information updated successfully'
	})
	@Post('update')
	@RequireLogin()
	async updateInfo(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
		return await this.userService.updateInfo(userId, updateUserDto);
	}

	@Get('update/captcha')
	@RequireLogin()
	async updateInfoCaptcha(@UserInfo('userId') userId: number) {
		const { email: address } = await this.userService.findUserDetailById(userId);

		const code = Math.random().toString().slice(2, 8);

		await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60);

		await this.emailService.sendMail({
			to: address,
			subject: '更改用户信息验证码',
			html: `<p>你的验证码是 ${code}</p>`
		});
		return '发送成功';
	}
}
