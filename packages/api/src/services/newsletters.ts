import { nanoid } from 'nanoid'
import { NewsletterEmail } from '../entity/newsletter_email'
import { StatusType } from '../entity/user'
import { env } from '../env'
import {
  CreateNewsletterEmailErrorCode,
  SubscriptionStatus,
} from '../generated/graphql'
import { getRepository } from '../repository'
import { userRepository } from '../repository/user'
import { keysToCamelCase } from '../utils/helpers'
import addressparser = require('nodemailer/lib/addressparser')

const parsedAddress = (emailAddress: string) => {
  const res = addressparser(emailAddress, { flatten: true })
  if (!res || res.length < 1) {
    throw new Error('Invalid email address')
  }
  return res[0].address
}

export const createNewsletterEmail = async (
  userId: string,
  confirmationCode?: string,
  folder?: string,
  name?: string,
  description?: string
): Promise<NewsletterEmail> => {
  const user = await userRepository.findById(userId)
  if (!user) {
    return Promise.reject({
      errorCode: CreateNewsletterEmailErrorCode.Unauthorized,
    })
  }
  // generate a random email address with username prefix
  const emailAddress = createRandomEmailAddress(user.profile.username, 8)

  return getRepository(NewsletterEmail).save({
    address: emailAddress,
    user,
    confirmationCode,
    name,
    description,
    folder,
  })
}

export const getNewsletterEmails = async (
  userId: string
): Promise<NewsletterEmail[]> => {
  return getRepository(NewsletterEmail)
    .createQueryBuilder('newsletter_email')
    .leftJoinAndSelect('newsletter_email.user', 'user')
    .leftJoinAndSelect(
      'newsletter_email.subscriptions',
      'subscriptions',
      'subscriptions.status = :status',
      {
        status: SubscriptionStatus.Active,
      }
    )
    .where('newsletter_email.user = :userId', { userId })
    .orderBy('newsletter_email.createdAt', 'DESC')
    .getMany()
}

export const deleteNewsletterEmail = async (id: string): Promise<boolean> => {
  const result = await getRepository(NewsletterEmail).delete(id)

  return !!result.affected
}

export const updateConfirmationCode = async (
  emailAddress: string,
  confirmationCode: string
): Promise<boolean> => {
  const address = parsedAddress(emailAddress)
  const result = await getRepository(NewsletterEmail)
    .createQueryBuilder()
    .where('LOWER(address) = :address', { address: address.toLowerCase() })
    .update({
      confirmationCode: confirmationCode,
    })
    .execute()

  return !!result.affected
}

export const findNewsletterEmailByAddress = async (
  emailAddress: string
): Promise<NewsletterEmail | null> => {
  const address = parsedAddress(emailAddress)
  return getRepository(NewsletterEmail)
    .createQueryBuilder('newsletter_email')
    .innerJoinAndSelect(
      'newsletter_email.user',
      'user',
      'user.status = :status',
      { status: StatusType.Active }
    )
    .where('LOWER(address) = :address', { address: address.toLowerCase() })
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
  return `${userName}-${nanoid(length)}e@${
    env.email.domain || `@${inbox}.omnivore.app`
  }`
}

export const findNewsletterEmailById = async (
  id: string
): Promise<NewsletterEmail | null> => {
  return getRepository(NewsletterEmail).findOneBy({ id })
}

export const updateNewsletterEmail = async (
  id: string,
  userId: string,
  newsletterEmail: Partial<NewsletterEmail>
): Promise<NewsletterEmail | null> => {
  const repo = getRepository(NewsletterEmail)
  const result = await repo
    .createQueryBuilder()
    .where('id = :id', { id })
    .andWhere('user_id = :userId', { userId })
    .update(newsletterEmail)
    .returning('*')
    .execute()

  if (
    !result.affected ||
    !Array.isArray(result.raw) ||
    result.raw.length === 0
  ) {
    return null
  }

  return keysToCamelCase(result.raw[0]) as NewsletterEmail
}
