import { EntityManager, EntityTarget, Repository } from 'typeorm'
import { appDataSource } from '../data_source'
import { Feature } from '../entity/feature'
import { Filter } from '../entity/filter'
import { Follower } from '../entity/follower'
import { Group } from '../entity/groups/group'
import { GroupMembership } from '../entity/groups/group_membership'
import { Invite } from '../entity/groups/invite'
import { Highlight } from '../entity/highlight'
import { Integration } from '../entity/integration'
import { LibraryItem } from '../entity/library_item'
import { NewsletterEmail } from '../entity/newsletter_email'
import { Profile } from '../entity/profile'
import { ReceivedEmail } from '../entity/received_email'
import { Recommendation } from '../entity/recommendation'
import { Reminder } from '../entity/reminder'
import { AbuseReport } from '../entity/reports/abuse_report'
import { ContentDisplayReport } from '../entity/reports/content_display_report'
import { Rule } from '../entity/rule'
import { Subscription } from '../entity/subscription'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { UserPersonalization } from '../entity/user_personalization'
import { Webhook } from '../entity/webhook'

export const setClaims = async (
  manager: EntityManager,
  uid = '00000000-0000-0000-0000-000000000000',
  dbRole = 'omnivore_user'
): Promise<unknown> => {
  return manager.query('SELECT * from omnivore.set_claims($1, $2)', [
    uid,
    dbRole,
  ])
}

export const getRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  return entityManager.getRepository(entity)
}

export const entityManager = appDataSource.manager

export const reminderRepository = getRepository(Reminder)
export const libraryItemRepository = getRepository(LibraryItem)
export const groupMembershipRepository = getRepository(GroupMembership)
export const groupRepository = getRepository(Group)
export const inviteRepository = getRepository(Invite)
export const abuseReportRepository = getRepository(AbuseReport)
export const contentDisplayReportRepository =
  getRepository(ContentDisplayReport)
export const featureRepository = getRepository(Feature)
export const filterRepository = getRepository(Filter)
export const followerRepository = getRepository(Follower)
export const highlightRepository = getRepository(Highlight)
export const integrationRepository = getRepository(Integration)
export const newsletterEmailRepository = getRepository(NewsletterEmail)
export const profileRepository = getRepository(Profile)
export const receivedEmailRepository = getRepository(ReceivedEmail)
export const recommendationRepository = getRepository(Recommendation)
export const ruleRepository = getRepository(Rule)
export const subscriptionRepository = getRepository(Subscription)
export const userDeviceTokenRepository = getRepository(UserDeviceToken)
export const userPersonalizationRepository = getRepository(UserPersonalization)
export const webhookRepository = getRepository(Webhook)
