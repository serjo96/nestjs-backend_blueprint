import config from "~/config/config";

export type UnionExpireType =
  | 'years'
  | 'year'
  | 'yrs'
  | 'yr'
  | 'y'
  | 'weeks'
  | 'week'
  | 'w'
  | 'days'
  | 'day'
  | 'd'
  | 'hours'
  | 'hour'
  | 'hrs'
  | 'hr'
  | 'h'
  | 'minutes'
  | 'minute'
  | 'mins'
  | 'min'
  | 'm'
  | 'seconds'
  | 'second'
  | 'secs'
  | 'sec'
  | 's'
  | 'milliseconds'
  | 'millisecond'
  | 'msecs'
  | 'msec'
  | 'ms';
export const authConfig = {
	jwt_secret_key: config.JWT_SECRET_KEY || 'SECRET',
	jwt_expire_time_value: +config.JWT_EXPIRE_TIME_VALUE || 15,
	jwt_expire_time_type: config.JWT_EXPIRE_TIME_TYPE as UnionExpireType || 'm',
	jwt_refresh_secret_key: config.JWT_REFRESH_SECRET_KEY || 'SECRET-REFRESH',
	jwt_refresh_expire_time_value: +config.JWT_REFRESH_EXPIRE_TIME_VALUE || 7,
	jwt_refresh_expire_time_type: config.JWT_REFRESH_EXPIRE_TIME_TYPE as UnionExpireType || 'd',
	encryptionKey: config.ENCRYPTION_KEY,
}

export type AuthConfig = typeof authConfig

