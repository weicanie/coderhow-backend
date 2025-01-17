import { Injectable } from '@nestjs/common';
import { AichatService } from '../aichat/aichat.service';

@Injectable()
export class ArticleService {
	constructor(private aichatService: AichatService) {}
}
