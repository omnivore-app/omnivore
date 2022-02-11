import { getRepository } from 'typeorm'
import { NewsletterEmail } from '../entity/newsletter_email'
import { nanoid } from 'nanoid'
import { User } from '../entity/user'
import { CreateNewsletterEmailErrorCode } from '../generated/graphql'
import { env } from '../env'

export const createNewsletterEmail = async (
  userId: string
): Promise<NewsletterEmail> => {
  const user = await getRepository(User).findOne(userId, {
    relations: ['profile'],
  })
  if (!user) {
    return Promise.reject({
      errorCode: CreateNewsletterEmailErrorCode.Unauthorized,
    })
  }
  // generate a random email address with username prefix
  const emailAddress = createRandomEmailAddress(user.profile.username, 8)

  return getRepository(NewsletterEmail)
    .create({
      address: emailAddress,
      user: user,
    })
    .save()
}

export const getNewsletterEmails = async (
  userId: string
): Promise<NewsletterEmail[]> => {
  return getRepository(NewsletterEmail).find({ where: { user: userId } })
}

export const deleteNewsletterEmail = async (id: string): Promise<boolean> => {
  const result = await getRepository(NewsletterEmail).delete(id)

  return !!result.affected
}

export const updateConfirmationCode = async (
  emailAddress: string,
  confirmationCode: string
): Promise<boolean> => {
  const result = await getRepository(NewsletterEmail)
    .createQueryBuilder()
    .where('address ILIKE :address', { address: emailAddress })
    .update({
      confirmationCode: confirmationCode,
    })
    .execute()

  return !!result.affected
}

export const getNewsletterEmail = async (
  emailAddress: string
): Promise<NewsletterEmail | undefined> => {
  return getRepository(NewsletterEmail)
    .createQueryBuilder('newsletter_email')
    .innerJoinAndSelect('newsletter_email.user', 'user')
    .where('address ILIKE :address', { address: emailAddress })
    .getOne()
}

const createRandomEmailAddress = (userName: string, length: number): string => {
  // format: hongbo-sduhfsjh1e@inbox.omnivore.app
  const inbox =
    'inbox' + (env.server.apiEnv === 'prod' ? '' : `-${env.server.apiEnv}`)
  /* nanoid can generate a random string ending with -
  which is not allowed as a last character in email address.
  So we append a 'e' to all random strings.

  when rand is sdfsdf-: jacksonh-sdfsdf-e@inbox.omnivore.app
  when rand is abcdef: jacksonh-abcdefe@inbox.omnivore.app
   */
  return `${userName}-${nanoid(length)}e@${inbox}.omnivore.app`
}
