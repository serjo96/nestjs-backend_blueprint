import config from "~/config/config";

export interface SmtpConfig {
	name: string
	login: string
	address: string
	password: string
	port: number
	host: string
}

export const smtpConfig = (): SmtpConfig => ({
	name: config.SMTP_NAME,
	address: config.SMTP_ADDRESS,
	login: config.SMTP_LOGIN,
	password: config.SMTP_PASSWORD,
	port: config.SMTP_PORT,
	host: config.SMTP_HOST,
})
