import { ReceivedEmail } from '../entity/received_email'
import { getRepository } from '../entity/utils'

export const saveReceivedEmail = async (
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  userId: string
): Promise<ReceivedEmail> => {
  return getRepository(ReceivedEmail).save({
    from,
    to,
    subject,
    text,
    html,
    user: { id: userId },
  })
}
