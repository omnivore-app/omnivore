import { Pool } from 'pg'
import { env } from '../../env'

export const sqlClient = new Pool({
  port: env.pg.port,
  host: env.pg.host,
  user: env.pg.userName,
  password: env.pg.password,
  max: env.pg.pool.max,
  database: env.pg.dbName,
})
