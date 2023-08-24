/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Knex } from 'knex'
import { LinkShareInfo } from '../../generated/graphql'
import { getPageByParam } from '../../elastic/pages'

// once we have links setup properly in the API we will remove this method
// and have a getShareInfoForLink method
export const getShareInfoForArticle = async (
  kx: Knex,
  userId: string,
  articleId: string
): Promise<LinkShareInfo | undefined> => {
  // TEMP: because the old API uses articles instead of Links, we are actually
  // getting an article ID here and need to map it to a link ID. When the API
  // is updated to use Links instead of Articles this will be removed.
  const page = await getPageByParam({ userId, _id: articleId })

  if (!page) {
    return undefined
  }

  const result = await kx('omnivore.link_share_info')
    .select('*')
    .where({ elastic_page_id: page.id })
    .first()

  return result
}

export const createOrUpdateLinkShareInfo = async (
  tx: Knex,
  linkId: string,
  title: string,
  description: string
): Promise<LinkShareInfo> => {
  const item = { linkId, title, description }
  const [result]: LinkShareInfo[] = await tx('omnivore.link_share_info')
    .insert(item)
    .onConflict('link_id')
    .merge()
    .returning('*')

  if (!result) {
    return Promise.reject(new Error('No result'))
  }

  return result
}
