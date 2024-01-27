
import config from "~/config/config";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";


const configOrm: PostgresConnectionOptions = {
	type: 'postgres',
	host: config.DB_HOST,
	port: +config.DB_PORT,
	username: config.DB_USER,
	password: config.DB_PASSWORD,
	database: config.DB_DATABASE,
};

export default configOrm;
