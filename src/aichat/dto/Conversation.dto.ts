// TODO 'validate'对dto进行校验、自动类型转换（number和string）客户端上传的number、服务器会拿到string!?
export class ConversationDto {
	key: string;
	label: string;
	content: string[];
}
