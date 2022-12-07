/* eslint-disable @typescript-eslint/naming-convention */
import * as dotenv from 'dotenv'
import Postgrator from 'postgrator'
import chalk from 'chalk'
import { Client } from '@elastic/elasticsearch'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config()

const log = (text: string, style: typeof chalk.white = chalk.white): void =>
  console.log(`${chalk.cyanBright('>')} ${style(text)}`)

interface DBEnv {
  host: string
  port: number
  database: string
  username: string
  password: string
}

const getEnv = (): DBEnv => {
  const {
    PG_HOST: host,
    PG_PORT: port,
    PG_DB: database,
    PG_USER: username,
    PG_PASSWORD: password,
  } = process.env

  if (typeof username !== 'string') {
    throw new Error('No PG user passed in env')
  }

  if (typeof password !== 'string') {
    throw new Error('No PG password passed in env')
  }

  const config = {
    host: host || '127.0.0.1',
    port: port ? parseInt(port, 10) : 5432,
    database: database || 'omnivore',
    username,
    password,
  }

  return config
}

const postgrator = new Postgrator({
  migrationDirectory: __dirname + '/migrations',
  driver: 'pg',
  ...getEnv(),
  // Schema table name
  schemaTable: 'schemaversion',
  // Validate migration md5 checksum to ensure the contents of the script have not changed
  validateChecksums: true,
})

log('Starting migration manager')

const targetMigration = process.argv[2]

const targetMigrationLabel = targetMigration
  ? `'${chalk.blue(targetMigration)}'`
  : chalk.blue('latest')

log(`Migrating to ${targetMigrationLabel}.\n`)

const logAppliedMigrations = (
  appliedMigrations: Postgrator.Migration[]
): void => {
  if (appliedMigrations.length > 0) {
    log(
      `Applied ${chalk.green(
        appliedMigrations.length.toString()
      )} migrations successfully:`
    )
    for (const migration of appliedMigrations) {
      const actionLabel =
        migration.action === 'do' ? chalk.green('+') : chalk.red('-')
      console.log(`  ${actionLabel} ${migration.name}`)
    }
  } else {
    log(`No Postgres migrations applied.`)
  }
}

export const INDEX_ALIAS = 'pages_alias'
export const esClient = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
  requestTimeout: 60000 * 30, // 30 minutes
  auth: {
    username: process.env.ELASTIC_USERNAME || '',
    password: process.env.ELASTIC_PASSWORD || '',
  },
})
// read index settings from file
const indexSettings = readFileSync(
  join(__dirname, 'elastic_migrations', 'index_settings.json'),
  'utf8'
)
const INDEX_NAME = 'pages'
const createIndex = async (): Promise<void> => {
  // create index
  await esClient.indices.create({
    index: INDEX_NAME,
    body: JSON.parse(indexSettings),
  })
}

const updateMappings = async (): Promise<void> => {
  // update mappings
  await esClient.indices.putMapping({
    index: INDEX_ALIAS,
    body: JSON.parse(indexSettings).mappings,
  })
}

// postgres migration
const postgresMigration = postgrator
  .migrate(targetMigration)
  .then(logAppliedMigrations)
  .catch((error) => {
    log(
      `${chalk.red('Postgres migration failed: ')}${error.message}`,
      chalk.red
    )
    const { appliedMigrations } = error
    logAppliedMigrations(appliedMigrations)
    process.exit(1)
  })

// elastic migration
log('Creating elastic index...')
const elasticMigration = esClient.indices
  .exists({ index: INDEX_ALIAS })
  .then(({ body: exists }) => {
    if (!exists) {
      return createIndex().then(() => log('Elastic index created.'))
    } else {
      log('Elastic index already exists.')
    }
  })
  .then(() => {
    log('Updating elastic index mappings...')
    return updateMappings().then(() => {
      log('Elastic index mappings updated.')
    })
  })
  .then(() => {
    log('Adding default state to pages in elastic...')
    return esClient
      .update_by_query({
        index: INDEX_ALIAS,
        requests_per_second: 250,
        scroll_size: 500,
        timeout: '30m',
        body: {
          script: {
            source: 'ctx._source.state = params.state',
            lang: 'painless',
            params: {
              state: 'SUCCEEDED',
            },
          },
          query: {
            bool: {
              must_not: [
                {
                  exists: {
                    field: 'state',
                  },
                },
              ],
            },
          },
        },
      })
      .then(() => log('Default state added.'))
  })
  .catch((error) => {
    log(`${chalk.red('Elastic migration failed: ')}${error.message}`, chalk.red)
    const { appliedMigrations } = error
    logAppliedMigrations(appliedMigrations)
    process.exit(1)
  })

Promise.all([postgresMigration, elasticMigration]).then(() => log('Exiting...'))
