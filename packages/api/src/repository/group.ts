import { entityManager } from '.'
import { Group } from '../entity/groups/group'

export const groupRepository = entityManager.getRepository(Group)
