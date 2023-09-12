import { ReceivedEmail } from '../entity/received_email'
import { authTrx } from '../repository'

export const saveReceivedEmail = async (
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  userId: string,
  type: 'article' | 'non-article' = 'non-article'
): Promise<ReceivedEmail> => {
  return authTrx(
    (t) =>
      t.getRepository(ReceivedEmail).save({
        from,
        to,
        subject,
        text,
        html,
        type,
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const updateReceivedEmail = async (
  id: string,
  type: 'article' | 'non-article',
  userId: string
) => {
  return authTrx(
    (t) => t.getRepository(ReceivedEmail).update(id, { type }),
    undefined,
    userId
  )
}

export const deleteReceivedEmail = async (id: string, userId?: string) => {
  return authTrx(
    (t) => t.getRepository(ReceivedEmail).delete(id),
    undefined,
    userId
  )
}

export const findReceivedEmailById = async (id: string, userId?: string) => {
  return authTrx(
    (t) => t.getRepository(ReceivedEmail).findOneBy({ id }),
    undefined,
    userId
  )
}
