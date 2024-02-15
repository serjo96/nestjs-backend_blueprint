import ormconfig from "~/ormconfig";
import {authConfig} from "~/config/auth.config";
import config from "~/config/config";
import {smtpConfig} from "~/config/smtp.config";


export const enum ConfigEnum {
  PROJECT = 'project',
  PORT = 'port',
  MODE = 'mode',
  FRONTEND_HOST = 'frontendHost',
  SENTRY_DSN = 'sentryDsn',
  AUTH = 'auth',
  DATABASE = 'database',
  SMTP = 'smtp',
}

export type ProjectConfig = {
  port: number,
  frontendHost: string,
  sentryDsn?: string,
}

export const mainConfig = () => ({
  project: {
    port: +config.PORT || 3000,
    frontendHost: config.FRONTEND_HOST,
    sentryDsn: config.SENTRY_DSN,
  },
  auth: {
    ...authConfig,
  },
  smtp: {
    ...smtpConfig(),
  },
  database: {
    ...ormconfig,
  },
})
