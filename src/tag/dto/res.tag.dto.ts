import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
	@ApiProperty({ name: 'id' })
	id: number;

	@ApiProperty({ name: 'content' })
	content: string;

	@ApiProperty({ name: 'create_at' })
	create_at: Date | null;

	@ApiProperty({ name: 'update_at' })
	update_at: Date | null;
}
