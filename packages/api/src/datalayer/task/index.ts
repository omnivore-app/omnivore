import { CreateSet, keys as modelKeys, UpdateSet, TaskData } from './model'
import DataModel from '../model'
import Knex from 'knex'
import { logMethod } from '../helpers'

class TaskModel extends DataModel<TaskData, CreateSet, UpdateSet> {
  public tableName = 'omnivore.task'
  protected modelKeys = modelKeys
  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async create(set: CreateSet, tx?: Knex.Transaction): Promise<TaskData> {
    if (tx) {
      return super.create(set, tx)
    }
    return this.kx.transaction((tx) => super.create(set, tx))
  }
}

export default TaskModel
