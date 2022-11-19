import { DataSource, EntityTarget, Repository } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import * as dotenv from 'dotenv'

dotenv.config()

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  schema: 'omnivore',
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  logging: ['query', 'info'],
  entities: [__dirname + '/entity/**/*{.js,.ts}'],
  namingStrategy: new SnakeNamingStrategy(),
})

export const createDBConnection = async () => {
  await AppDataSource.initialize()
}

export const closeDBConnection = async () => {
  await AppDataSource.destroy()
}

export const getRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  return AppDataSource.getRepository(entity)
}
