import * as Joi from '@hapi/joi';

const expireTimeTypes = [
  'years', 'year', 'yrs', 'yr', 'y',
  'weeks', 'week', 'w',
  'days', 'day', 'd',
  'hours', 'hour', 'hrs', 'hr', 'h',
  'minutes', 'minute', 'mins', 'min', 'm',
  'seconds', 'second', 'secs', 'sec', 's',
  'milliseconds', 'millisecond', 'msecs', 'msec', 'ms'
];
export const validationSchema = Joi.object({
  project: {
    NODE_ENV: Joi.string().valid('development', 'production', 'staging', 'docker'),
    port: Joi.number().default(3000),
    frontendHost: Joi.string().required(),
    sentryDsn: Joi.string(),
  },
  database: {
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
  },
  auth: {
    JWT_SECRET_KEY: Joi.string().required(),
    JWT_EXPIRE_TIME_VALUE: Joi.number(),
    jwt_expire_time_type: Joi.string().valid(...expireTimeTypes).required(),
    JWT_REFRESH_SECRET_KEY: Joi.string().required(),
    JWT_REFRESH_EXPIRE_TIME_VALUE: Joi.number(),
    jwt_refresh_expire_time_type: Joi.string().valid(...expireTimeTypes).required(),
    ENCRYPTION_KEY: Joi.string().required(),
  },
  smtp: {
    SMTP_NAME: Joi.string(),
    SMTP_LOGIN: Joi.string(),
    SMTP_ADDRESS: Joi.string(),
    SMTP_PASSWORD: Joi.string(),
    SMTP_PORT: Joi.number(),
    SMTP_HOST: Joi.number(),
  },
})
