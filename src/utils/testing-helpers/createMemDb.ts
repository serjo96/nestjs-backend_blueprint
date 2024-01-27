import { EntitySchema, createConnection } from 'typeorm';
type Entity = () => void | string | EntitySchema<any>;

export async function createMemDB(entities: Entity[]) {
  return createConnection({
    // name, // let TypeORM manage the connections
    type: 'postgres',
    database: ':memory:',
    entities,
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
}
