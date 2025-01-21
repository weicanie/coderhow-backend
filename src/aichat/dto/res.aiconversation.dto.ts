import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';

export class AiConversationDto {
	@ApiProperty({ name: 'content' })
	content: JsonValue;

	@ApiProperty({ name: 'id' })
	id: number;

	@ApiProperty({ name: 'user_id' })
	user_id: number;

	@ApiProperty({ name: 'create_at' })
	create_at: Date | null;

	@ApiProperty({ name: 'update_at' })
	update_at: Date | null;

	@ApiProperty({ name: 'label' })
	label: string;

	@ApiProperty({ name: 'keyname' })
	keyname: string;
}
