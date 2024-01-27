import config from "~/config/config";

export const authConfig = {
	jwt_secret_key: config.JWT_SECRET_KEY || 'SECRET',
	jwt_expire_time: config.JWT_EXPIRE_TIME || '15m',
	jwt_expire_time_value: config.JWT_EXPIRE_TIME_VALUE || '15',
	jwt_expire_time_type: config.JWT_EXPIRE_TIME_TYPE || 'm',
	jwt_refresh_secret_key: config.JWT_REFRESH_SECRET_KEY || 'SECRET-REFRESH',
	jwt_refresh_expire_time: config.JWT_REFRESH_EXPIRE_TIME || '7d',
	jwt_refresh_expire_time_value: config.JWT_REFRESH_EXPIRE_TIME_VALUE || '7',
	jwt_refresh_expire_time_type: config.JWT_REFRESH_EXPIRE_TIME_TYPE || 'd',
	encryptionKey: config.ENCRYPTION_KEY,
}

export type AuthConfig = typeof authConfig

