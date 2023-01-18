import { ReceivedEmail } from '../entity/received_email'
import { getRepository } from '../entity/utils'

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
  userId: string,
  from: string,
  to: string,
  subject: string,
  type: 'article' | 'non-article'
) => {
  await getRepository(ReceivedEmail)
    .createQueryBuilder()
    .update()
    .set({ type })
    // .where('user_id = :userId', { userId })
    // .andWhere('from = :from', { from })
    // .andWhere('to = :to', { to })
    // .andWhere('subject = :subject', { subject })
    .where({
      user: { id: userId },
      from,
      to,
      subject,
    })
    .orderBy('created_at', 'DESC')
    .limit(1)
    .execute()
}
