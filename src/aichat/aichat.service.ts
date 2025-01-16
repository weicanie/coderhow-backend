import { Injectable } from '@nestjs/common';
import { CreateAichatDto } from './dto/create-aichat.dto';
import { UpdateAichatDto } from './dto/update-aichat.dto';

@Injectable()
export class AichatService {
  create(createAichatDto: CreateAichatDto) {
    return 'This action adds a new aichat';
  }

  findAll() {
    return `This action returns all aichat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aichat`;
  }

  update(id: number, updateAichatDto: UpdateAichatDto) {
    return `This action updates a #${id} aichat`;
  }

  remove(id: number) {
    return `This action removes a #${id} aichat`;
  }
}
