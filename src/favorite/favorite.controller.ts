import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '../decorator';
import { FavoriteService } from './favorite.service';

@ApiTags('收藏')
@Controller('favorite')
@RequireLogin()
export class FavoriteController {
	constructor(private readonly favoriteService: FavoriteService) {}

	@ApiOperation({ summary: '获取收藏列表' })
	@ApiResponse({
		status: 200,
		description: '获取成功',
		type: Array
	})
	@Get('list')
	async list(@UserInfo('userId') userId: number) {
		return this.favoriteService.list(userId);
	}

	@ApiOperation({ summary: '添加收藏' })
	@ApiQuery({
		name: 'chatRecordId',
		type: Number,
		description: '聊天历史ID'
	})
	@ApiResponse({
		status: 200,
		description: '添加成功'
	})
	@Get('add')
	async add(@UserInfo('userId') userId: number, @Query('chatRecordId') chatRecordId: number) {
		return this.favoriteService.add(userId, chatRecordId);
	}

	@ApiOperation({ summary: '删除收藏' })
	@ApiQuery({
		name: 'id',
		type: Number,
		description: '收藏ID'
	})
	@ApiResponse({
		status: 200,
		description: '删除成功'
	})
	@Get('del')
	async del(@Query('id') id: number) {
		return this.favoriteService.del(id);
	}
}
