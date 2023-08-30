import { EntityManager, EntityTarget, Repository } from 'typeorm'
import { AppDataSource } from '../data-source'
import { ApiKey } from '../entity/api_key'
import { Feature } from '../entity/feature'
import { Filter } from '../entity/filter'
import { Follower } from '../entity/follower'
import { Group } from '../entity/groups/group'
import { GroupMembership } from '../entity/groups/group_membership'
import { Invite } from '../entity/groups/invite'
import { Highlight } from '../entity/highlight'
import { Integration } from '../entity/integration'
import { Label } from '../entity/label'
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
import { UploadFile } from '../entity/upload_file'
import { User } from '../entity/user'
import { UserDeviceToken } from '../entity/user_device_tokens'
import { UserPersonalization } from '../entity/user_personalization'
import { Webhook } from '../entity/webhook'

export const setClaims = async (
  t: EntityManager,
  uid: string
): Promise<void> => {
  const dbRole = 'omnivore_user'
  return t
    .query('SELECT * from omnivore.set_claims($1, $2)', [uid, dbRole])
    .then()
}

export const getRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
  return entityManager.getRepository(entity)
}

export const entityManager = AppDataSource.manager

export const userRepository = getRepository(User)
export const uploadFileRepository = getRepository(UploadFile)
export const reminderRepository = getRepository(Reminder)
export const libraryItemRepository = getRepository(LibraryItem)
export const groupMembershipRepository = getRepository(GroupMembership)
export const groupRepository = getRepository(Group)
export const inviteRepository = getRepository(Invite)
export const abuseReportRepository = getRepository(AbuseReport)
export const contentDisplayReportRepository =
  getRepository(ContentDisplayReport)
export const apiKeyRepository = getRepository(ApiKey)
export const featureRepository = getRepository(Feature)
export const filterRepository = getRepository(Filter)
export const followerRepository = getRepository(Follower)
export const highlightRepository = getRepository(Highlight)
export const integrationRepository = getRepository(Integration)
export const labelRepository = getRepository(Label)
export const newsletterEmailRepository = getRepository(NewsletterEmail)
export const profileRepository = getRepository(Profile)
export const receivedEmailRepository = getRepository(ReceivedEmail)
export const recommendationRepository = getRepository(Recommendation)
export const ruleRepository = getRepository(Rule)
export const subscriptionRepository = getRepository(Subscription)
export const userDeviceTokenRepository = getRepository(UserDeviceToken)
export const userPersonalizationRepository = getRepository(UserPersonalization)
export const webhookRepository = getRepository(Webhook)
