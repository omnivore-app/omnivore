/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import DataModel from './model'
import Knex, { Transaction } from 'knex'
import DataLoader from 'dataloader'
import { snakeCase } from 'snake-case'
import { buildLogger } from '../utils/logger'
import { SetClaimsRole } from '../utils/dictionary'

const logger = buildLogger('datalayer')

export const setClaims = async (
  tx: Transaction,
  uuid?: string,
  userRole?: string
): Promise<void> => {
  const uid = uuid || '00000000-0000-0000-0000-000000000000'
  const dbRole =
    userRole === SetClaimsRole.ADMIN ? 'omnivore_admin' : 'omnivore_user'
  return tx.raw('SELECT * from omnivore.set_claims(?, ?)', [uid, dbRole])
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Set to true to enable DB request statistics collection
 * When on, every 5 seconds CallCounter will be printing an object that counts DB calls by types.
 * **Must be off on prod**.
 * */
export const ENABLE_DB_REQUEST_LOGGING = false

/** Doesnt preserve function context */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<A extends any[]>(
  func: (...args: A) => void,
  wait: number,
  immediate: boolean
): (...args: A) => void {
  let timeout: NodeJS.Timeout | null
  return function (...args: A): void {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = global.setTimeout(function () {
      timeout = null
      if (!immediate) func(...args)
    }, wait)
    if (immediate && !timeout) func(...args)
  }
}

class CallCounter {
  private counter: Record<string, number> = {}

  log(tableName: string, methodName: string, params: string): void {
    const key = `${tableName}.${methodName}`
    if (key in this.counter) {
      this.counter[key]++
    } else {
      this.counter[key] = 1
    }
    const count = this.counter[key]
    // display in console the function call details
    logger.info(`Call (${count}): ${key}(${params})`, {
      labels: {
        source: 'callCounter',
      },
    })
    this.printCounts()
  }

  printCounts = debounce(() => logger.info(this.counter), 5000, false)
}

export const globalCounter = new CallCounter()

export function logMethod(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: Record<string, any>,
  propertyName: string,
  propertyDesciptor: PropertyDescriptor
): PropertyDescriptor {
  const method = propertyDesciptor.value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyDesciptor.value = async function (
    this: DataModel<any, any, any>,
    ...args: any[]
  ) {
    // invoke wrapped function and get its return value
    const result = await method.apply(this, args)

    if (ENABLE_DB_REQUEST_LOGGING) {
      const params = args.map((a) => JSON.stringify(a)).join()
      globalCounter.log(this.tableName, propertyName, params)
    }

    return result
  }
  return propertyDesciptor
}

/**
 * Creates a non-caching loader that fetches model data by a foreign key
 * @example Fetching replies by question ID
 * */
export const edgeLoader = <
  ModelData extends { id: string },
  ForeignKey extends keyof ModelData
>(
  kx: Knex,
  tableName: string,
  foreignKey: ForeignKey,
  modelKeys: readonly string[]
): DataLoader<string, ModelData[]> =>
  new DataLoader(
    async (keys: readonly string[]) => {
      if (ENABLE_DB_REQUEST_LOGGING) {
        globalCounter.log(
          tableName,
          `load_by_${foreignKey}`,
          JSON.stringify(keys)
        )
      }
      const columnName = snakeCase(foreignKey as string)
      try {
        const rows: ModelData[] = await kx(tableName)
          .select(modelKeys)
          .whereIn(columnName, keys)

        const keyMap: Record<string, ModelData[]> = {}
        for (const row of rows) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const keyValue = row[foreignKey] as any as string
          if (keyValue in keyMap) {
            keyMap[keyValue].push(row)
          } else keyMap[keyValue] = [row]
        }
        const result = []
        for (const key of keys) {
          result.push(keyMap[key] || [])
        }
        if (result.length !== keys.length) {
          console.error('DataModel error: count mismatch ', keys, result)
        }
        return result
      } catch (e) {
        console.error('DataModel error: ', e)
        throw e
      }
    },
    { cache: false }
  )
