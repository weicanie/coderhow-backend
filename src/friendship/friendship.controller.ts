import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Query
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { resBundle } from '../utils';
import { FriendAddDto } from './dto/friend-add.dto';
import { FriendshipService } from './friendship.service';
@ApiTags('好友')
@Controller('friendship')
@RequireLogin()
export class FriendshipController {
	constructor(private readonly friendshipService: FriendshipService) {}
	@ApiOperation({ summary: '添加好友请求' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '添加好友请求'
	})
	@ApiBody({ type: FriendAddDto })
	@Post('add')
	async add(@Body() friendAddDto: FriendAddDto, @UserInfo('userId') userId: number) {
		return this.friendshipService.add(friendAddDto, userId);
	}
	@ApiOperation({ summary: '获取好友请求列表' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '获取好友请求列表'
	})
	@Get('request_list')
	async list(@UserInfo('userId') userId: number) {
		return this.friendshipService.list(userId);
	}
	@ApiOperation({ summary: '同意好友请求' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '同意好友请求'
	})
	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		description: '好友ID'
	})
	@Get('agree/:id')
	async agree(@Param('id') friendId: number, @UserInfo('userId') userId: number) {
		if (!friendId) {
			throw new BadRequestException('添加的好友 id 不能为空');
		}
		return this.friendshipService.agree(friendId, userId);
	}
	@ApiOperation({ summary: '拒绝好友请求' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '拒绝好友请求'
	})
	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		description: '好友ID'
	})
	@Get('reject/:id')
	async reject(@Param('id') friendId: number, @UserInfo('userId') userId: number) {
		if (!friendId) {
			throw new BadRequestException('添加的好友 id 不能为空');
		}
		return this.friendshipService.reject(friendId, userId);
	}
	@ApiOperation({ summary: '获取好友列表' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '获取好友列表'
	})
	@Get('list')
	async getfriendlist(@UserInfo('userId') userId: number, @Query('name') name: string) {
		const res = await this.friendshipService.getFriendlist(userId);
		return resBundle<typeof res>(res);
	}
	@ApiOperation({ summary: '获取好友列表' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '获取好友'
	})
	@ApiQuery({
		name: 'name',
		required: false,
		type: String,
		description: '好友昵称或用户名'
	})
	@Get('list')
	async getfriend(@UserInfo('userId') userId: number, @Query('name') name: string) {
		const res = await this.friendshipService.getFriend(userId, name);
		return resBundle<typeof res>(res);
	}
	@ApiOperation({ summary: '删除好友' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		description: '删除好友'
	})
	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		description: '好友ID'
	})
	@Get('remove/:id')
	async remove(@Param('id') friendId: number, @UserInfo('userId') userId: number) {
		return this.friendshipService.remove(friendId, userId);
	}
}
