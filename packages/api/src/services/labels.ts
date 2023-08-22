import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { addLabelInPage } from '../elastic/labels'
import { PageContext } from '../elastic/types'
import { getRepository } from '../entity'
import { Label } from '../entity/label'
import { Link } from '../entity/link'
import { User } from '../entity/user'
import { CreateLabelInput } from '../generated/graphql'
import { generateRandomColor } from '../utils/helpers'
import { logger } from '../utils/logger'

const INTERNAL_LABELS_IN_LOWERCASE = [
  'newsletters',
  'favorites',
  'rss',
  'library',
]

const isLabelInternal = (name: string): boolean => {
  return INTERNAL_LABELS_IN_LOWERCASE.includes(name.toLowerCase())
}

const batchGetLabelsFromLinkIds = async (
  linkIds: readonly string[]
): Promise<Label[][]> => {
  const links = await getRepository(Link).find({
    where: { id: In(linkIds as string[]) },
    relations: ['labels'],
  })

  return linkIds.map(
    (linkId) => links.find((link) => link.id === linkId)?.labels || []
  )
}

export const labelsLoader = new DataLoader(batchGetLabelsFromLinkIds)

export const addLabelToPage = async (
  ctx: PageContext,
  pageId: string,
  label: {
    name: string
    color: string
    description?: string
  }
): Promise<boolean> => {
  const user = await getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    return false
  }

  let labelEntity = await getLabelByName(user.id, label.name)

  if (!labelEntity) {
    logger.info('creating new label', label.name)

    labelEntity = await createLabel(user.id, label)
  }

  logger.info('adding label to page', label.name, pageId)

  return addLabelInPage(
    pageId,
    {
      id: labelEntity.id,
      name: labelEntity.name,
      color: labelEntity.color,
      description: labelEntity.description,
      createdAt: labelEntity.createdAt,
    },
    ctx
  )
}

export const getLabelsByIds = async (
  userId: string,
  labelIds: string[]
): Promise<Label[]> => {
  return getRepository(Label).find({
    where: { id: In(labelIds), user: { id: userId } },
    select: ['id', 'name', 'color', 'description', 'createdAt'],
  })
}

export const getLabelByName = async (
  userId: string,
  name: string
): Promise<Label | null> => {
  return getRepository(Label)
    .createQueryBuilder()
    .where({ user: { id: userId } })
    .andWhere('LOWER(name) = LOWER(:name)', { name })
    .getOne()
}

export const createLabel = async (
  userId: string,
  label: {
    name: string
    color?: string | null
    description?: string | null
  }
): Promise<Label> => {
  return getRepository(Label).save({
    user: { id: userId },
    name: label.name,
    color: label.color || generateRandomColor(), // assign a random color if not provided
    description: label.description,
    internal: isLabelInternal(label.name),
  })
}

export const createLabels = async (
  ctx: PageContext,
  labels: CreateLabelInput[]
): Promise<Label[]> => {
  const labelEntities = await getRepository(Label)
    .createQueryBuilder()
    .where({
      user: { id: ctx.uid },
    })
    .andWhere('LOWER(name) IN (:...names)', {
      names: labels.map((l) => l.name.toLowerCase()),
    })
    .getMany()

  const existingLabelsInLowerCase = labelEntities.map((l) =>
    l.name.toLowerCase()
  )
  const newLabels = labels.filter(
    (l) => !existingLabelsInLowerCase.includes(l.name.toLowerCase())
  )
  // create new labels
  const newLabelEntities = await getRepository(Label).save(
    newLabels.map((l) => ({
      name: l.name,
      description: l.description,
      color: l.color || generateRandomColor(),
      internal: isLabelInternal(l.name),
      user: { id: ctx.uid },
    }))
  )
  return [...labelEntities, ...newLabelEntities]
}
