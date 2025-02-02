import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Patch,
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
import { RequireLogin, RequirePermission } from '../decorator';
import { TagDto } from './dto/res.tag.dto';
import { TagService } from './tag.service';
@ApiTags('标签')
@Controller('tag')
export class TagController {
	constructor(private readonly tagService: TagService) {}
	@ApiOperation({ summary: '添加标签' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Number
	})
	@ApiBody({
		type: String
	})
	@Post()
	@RequireLogin()
	async addTag(@Body('content') content: string) {
		return await this.tagService.addTag(content);
	}
	@ApiOperation({ summary: '获取标签列表' })
	@ApiResponse({
		status: HttpStatus.OK,
		type: Array<TagDto>
	})
	@ApiQuery({
		name: 'page',
		type: Number,
		required: true,
		example: 1
	})
	@ApiQuery({
		name: 'pageSize',
		type: Number,
		required: true,
		example: 1
	})
	@Get()
	async getTagList(@Query() pageInfo: { page: number; pageSize: number }) {
		const { page = 1, pageSize = 7 } = pageInfo;
		return await this.tagService.getTagList(page, pageSize);
	}
	@ApiOperation({ summary: '给文章添加标签' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Object
	})
	@ApiBody({
		type: [String]
	})
	@ApiParam({
		name: 'articleId',
		type: String,
		required: true,
		example: '1'
	})
	@Patch('/article/:articleId')
	@RequireLogin()
	@RequirePermission('article')
	async addTagToArticle(@Param('articleId') articleId: string, @Body('tag') taglist: string[]) {
		return await this.tagService.addTagToArticle(articleId, taglist);
	}
	@ApiOperation({ summary: '删除文章标签' })
	@ApiBearerAuth('bearer')
	@ApiResponse({
		status: HttpStatus.OK,
		type: Number
	})
	@ApiParam({
		name: 'articleId',
		type: Number,
		required: true,
		example: '1'
	})
	@ApiParam({
		name: 'tagId',
		type: Number,
		required: true,
		example: '1'
	})
	@Delete('/article/:articleId/:tagId')
	@RequireLogin()
	@RequirePermission('article')
	async removeTagFromArticle(@Param('articleId') articleId: string, @Param('tagId') tagId: string) {
		return await this.tagService.removeTagFromArticle(tagId, articleId);
	}
}
