import { Label } from '../entity/label'
import { ILike, In } from 'typeorm'
import { PageContext } from '../elastic/types'
import { User } from '../entity/user'
import { addLabelInPage } from '../elastic/labels'
import { getRepository } from '../entity/utils'
import { Link } from '../entity/link'
import DataLoader from 'dataloader'

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
