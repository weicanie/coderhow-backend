import { createHmac } from 'crypto';
function passwordEncrypt(password: string) {
	const pwd = createHmac('sha256', process.env.ENC_SECRET).update(password).digest('hex');
	return pwd;
}
function resBundle<T = unknown>(data: T) {
	/* 	return {
		data,
		message: 'success',
		code: 200
	}; */
	return data;
}
export { passwordEncrypt, resBundle };
