import { appDataSource } from '../data_source'
import { Topic } from '../entity/topic'

export const findTopicByName = async (
  name: string,
  em = appDataSource.manager
): Promise<Topic | null> => em.getRepository(Topic).findOneBy({ name })
