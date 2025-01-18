import { Module } from '@nestjs/common';
import { DbModule } from '../DB/db.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
	imports: [DbModule]
})
export class UserModule {}
