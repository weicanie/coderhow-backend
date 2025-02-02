import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
	transporter: Transporter;

	constructor() {
		this.transporter = createTransport({
			host: 'smtp.qq.com',
			port: 587,
			secure: false,
			auth: {
				user: '2042365244@qq.com',
				pass: 'dbombhqonztrbgfa'
			}
		});
	}

	async sendMail({ to, subject, html }) {
		await this.transporter.sendMail({
			from: {
				name: '聊天室项目',
				address: '2042365244@qq.com'
			},
			to,
			subject,
			html
		});
	}
}
