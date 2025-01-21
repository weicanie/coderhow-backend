import { ApiProperty } from '@nestjs/swagger';

export class ImagesDto {
	@ApiProperty({ name: 'image_url' })
	image_url: string;
}
