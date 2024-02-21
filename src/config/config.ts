import {existsSync, readFileSync} from "fs";
import * as dotenv from 'dotenv'
import {UnionExpireType} from "~/config/auth.config";

export type ConfigType = {
  DB_HOST?: string;
  DATABASE_URL?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_DATABASE?: string;

  PORT?: number;
  FRONTEND_HOST?: string;
  BASE_URL?: string;
  SENTRY_DSN?: string;

  SMTP_NAME?: string;
  SMTP_LOGIN?: string;
  SMTP_ADDRESS?: string;
  SMTP_PASSWORD?: string;
  SMTP_PORT?: number;
  SMTP_HOST?: string;

  JWT_SECRET_KEY?: string;
  JWT_EXPIRE_TIME_VALUE?: string;
  JWT_EXPIRE_TIME_TYPE?: UnionExpireType;
  JWT_REFRESH_SECRET_KEY?: string;
  JWT_REFRESH_EXPIRE_TIME_VALUE?: string;
  JWT_REFRESH_EXPIRE_TIME_TYPE?: UnionExpireType;
  ENCRYPTION_KEY?: string;
}

let config = {} as ConfigType;
const envState = ['production', 'staging', 'development', 'docker']
let envFile = '.env.development';

if (envState.includes(process.env.NODE_ENV)) {
  envFile = `.env.${process.env.NODE_ENV}`
}

const envFileExists = existsSync(envFile);
if (envFileExists) {
  config = dotenv.parse(readFileSync(envFile));
} else {
  config = { DATABASE_URL: process.env.DATABASE_URL || '' };
}
config = { ...config, ...process.env };

export default config;
