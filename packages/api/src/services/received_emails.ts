import { ReceivedEmail } from '../entity/received_email'
import { authTrx } from '../repository'

export const saveReceivedEmail = async (
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  userId: string,
  type: 'article' | 'non-article' = 'non-article',
  replyTo?: string
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
        replyTo,
      }),
    {
      uid: userId,
    }
  )
}

export const updateReceivedEmail = async (
  id: string,
  type: 'article' | 'non-article',
  userId: string
) => {
  return authTrx(
    (t) =>
      t
        .getRepository(ReceivedEmail)
        .update({ id, user: { id: userId } }, { type }),
    {
      uid: userId,
    }
  )
}

export const deleteReceivedEmail = async (id: string, userId: string) => {
  return authTrx(
    (t) => t.getRepository(ReceivedEmail).delete({ id, user: { id: userId } }),
    {
      uid: userId,
    }
  )
}

export const findReceivedEmailById = async (id: string, userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(ReceivedEmail).findOneBy({ id, user: { id: userId } }),
    {
      uid: userId,
    }
  )
}
