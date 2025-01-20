import { JsonValue } from '@prisma/client/runtime/library';

export class AiConversationDto {
	content: JsonValue;
	id: number;
	user_id: number;
	create_at: Date | null;
	update_at: Date | null;
	label: string;
	keyname: string;
}
