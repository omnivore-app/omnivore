import { Label } from '../entity/label'
import { ILike, In } from 'typeorm'
import { PageContext } from '../elastic/types'
import { User } from '../entity/user'
import { addLabelInPage, updateLabelsInPage } from '../elastic/labels'
import { getRepository } from '../entity/utils'
import { Link } from '../entity/link'
import DataLoader from 'dataloader'
import { generateRandomColor } from '../utils/helpers'

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

  let labelEntity = await getRepository(Label).findOneBy({
    user: { id: user.id },
    name: ILike(label.name),
  })

  if (!labelEntity) {
    console.log('creating new label', label.name)

    labelEntity = await getRepository(Label).save({
      ...label,
      user,
    })
  }

  console.log('adding label to page', label.name, pageId)

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

export const createLabel = async (
  userId: string,
  label: {
    name: string
    color?: string
    description?: string
  }
): Promise<Label> => {
  const existingLabel = await getRepository(Label).findOneBy({
    user: { id: userId },
    name: ILike(label.name),
  })

  if (existingLabel) {
    return existingLabel
  }

  // create a new label and assign a random color if not provided
  label.color = label.color || generateRandomColor()

  return getRepository(Label).save({
    ...label,
    user: { id: userId },
  })
}

export const addLabelsToNewPage = async (
  ctx: PageContext,
  pageId: string,
  labels: {
    name: string
    color?: string | null
    description?: string | null
  }[]
): Promise<boolean> => {
  const user = await getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    console.log('user not found')
    return false
  }

  const labelEntities = await getRepository(Label).findBy({
    user: { id: user.id },
    name: In(labels.map((l) => l.name)),
  })

  const existingLabels = labelEntities.map((l) => l.name)
  const newLabels = labels.filter((l) => !existingLabels.includes(l.name))
  // create new labels
  const newLabelEntities = await getRepository(Label).save(
    newLabels.map((l) => ({
      ...l,
      color: l.color || generateRandomColor(),
      user,
    }))
  )
  // add all labels to page
  return updateLabelsInPage(
    pageId,
    [...newLabelEntities, ...labelEntities],
    ctx
  )
}
