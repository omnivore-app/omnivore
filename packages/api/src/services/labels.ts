import { Label } from '../entity/label'
import { ILike } from 'typeorm'
import { PageContext } from '../elastic/types'
import { User } from '../entity/user'
import { addLabelInPage } from '../elastic'
import { AppDataSource } from '../server'

export const addLabelToPage = async (
  ctx: PageContext,
  pageId: string,
  label: {
    name: string
    color: string
    description?: string
  }
): Promise<boolean> => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: ctx.uid,
  })
  if (!user) {
    return false
  }

  let labelEntity = await AppDataSource.getRepository(Label).findOneBy({
    user: user,
    name: ILike(label.name),
  })

  if (!labelEntity) {
    console.log('creating new label', label.name)

    labelEntity = await AppDataSource.getRepository(Label).save({
      ...label,
      user,
    })
  }

  console.log('adding label to page', label.name, pageId)

  return addLabelInPage(pageId, labelEntity, ctx)
}
