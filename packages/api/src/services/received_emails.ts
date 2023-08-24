import { ReceivedEmail } from '../entity/received_email'
import { entityManager, getRepository } from '../repository'

export const saveReceivedEmail = async (
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  userId: string,
  type: 'article' | 'non-article' = 'non-article'
): Promise<ReceivedEmail> => {
  return getRepository(ReceivedEmail).save({
    from,
    to,
    subject,
    text,
    html,
    type,
    user: { id: userId },
  })
}

export const updateReceivedEmail = async (
  id: string,
  type: 'article' | 'non-article',
  em = entityManager
) => {
  await em.getRepository(ReceivedEmail).update(id, { type })
}
