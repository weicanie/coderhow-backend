import { Request } from 'express';

export interface UserInfoFromToken {
	userId: string;
	username: string;
}
export interface MyRequest extends Request {
	userInfo: UserInfoFromToken;
	token: string;
}
export type VerifyMetaData = {
	requireLogin?: boolean;
	requireOwn?: boolean;
	tableName?: string;
	resourceId?: string;
};
