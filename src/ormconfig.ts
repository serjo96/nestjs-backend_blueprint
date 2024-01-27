import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

import { isProd, isStage } from '~/utils/envType';
import dbConfig from "~/config/db.config";

enum filesType {
  MIGRATION = 'migration',
  SUBSCRIBERS = 'subscribers',
  ENTITY = '.entity',
}

type ConfigType = {
  POSTGRES_HOST?: string;
  DATABASE_URL?: string;
  POSTGRES_PORT?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
};

let config = {} as ConfigType;

const configFile = `${process.env.NODE_ENV || 'development'}.env`;

const envFileExists = existsSync(configFile);
if (envFileExists) {
  config = dotenv.parse(readFileSync(configFile));
} else {
  config = { DATABASE_URL: process.env.DATABASE_URL || '' };
}
config = { ...config, ...process.env };

function getFilesDirectory(type: filesType) {
  const directory = isProd ? 'dist' : path.join(__dirname, '..');

  switch (type) {
    case filesType.ENTITY:
      return `${directory}/**/*.entity.{ts,js}`;
    case filesType.SUBSCRIBERS:
      return `${directory}/**/*.subscriber.{ts,js}`;
    case filesType.MIGRATION:
      return `${directory}/migrations/*.{ts,js}`;
  }
}

const configOrm: DataSourceOptions = {
  ...dbConfig,
  logging: false,
  synchronize: false,
  entities: [getFilesDirectory(filesType.ENTITY)],
  migrations: [getFilesDirectory(filesType.MIGRATION)],
  subscribers: [getFilesDirectory(filesType.SUBSCRIBERS)],
  migrationsRun: isProd || isStage,
  cache: false,
  ssl: (isProd || isStage) && {
    rejectUnauthorized: false,
  },
};

export default new DataSource(configOrm);
