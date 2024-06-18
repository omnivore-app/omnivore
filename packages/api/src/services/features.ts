import * as jwt from 'jsonwebtoken'
import { DeepPartial, FindOptionsWhere, IsNull, Not } from 'typeorm'
import { appDataSource } from '../data_source'
import { Feature } from '../entity/feature'
import { LibraryItem } from '../entity/library_item'
import { Subscription, SubscriptionStatus } from '../entity/subscription'
import { env } from '../env'
import { OptInFeatureErrorCode } from '../generated/graphql'
import { authTrx, getRepository } from '../repository'
import { logger } from '../utils/logger'

const MAX_ULTRA_REALISTIC_USERS = 1500
const MAX_YOUTUBE_TRANSCRIPT_USERS = 500
const MAX_NOTION_USERS = 1000
const MAX_AIDIGEST_USERS = 1000

export enum FeatureName {
  AISummaries = 'ai-summaries',
  YouTubeTranscripts = 'youtube-transcripts',
  UltraRealisticVoice = 'ultra-realistic-voice',
  Notion = 'notion',
  AIDigest = 'ai-digest',
  AIExplain = 'ai-explain',
}

export function isOptInFeatureErrorCode(
  value: Feature | OptInFeatureErrorCode
): value is OptInFeatureErrorCode {
  return Object.values(OptInFeatureErrorCode).includes(
    value as OptInFeatureErrorCode
  )
}

export const getFeatureName = (name: string): FeatureName | undefined => {
  return Object.values(FeatureName).find((v) => v === name)
}

export const optInFeature = async (
  name: FeatureName,
  uid: string
): Promise<Feature | OptInFeatureErrorCode> => {
  switch (name) {
    case FeatureName.UltraRealisticVoice:
      return optInLimitedFeature(
        FeatureName.UltraRealisticVoice,
        uid,
        MAX_ULTRA_REALISTIC_USERS
      )
    case FeatureName.YouTubeTranscripts:
      return optInLimitedFeature(
        FeatureName.YouTubeTranscripts,
        uid,
        MAX_YOUTUBE_TRANSCRIPT_USERS
      )
    case FeatureName.Notion:
      return optInLimitedFeature(FeatureName.Notion, uid, MAX_NOTION_USERS)
    case FeatureName.AIDigest: {
      const eligible = await userDigestEligible(uid)
      if (!eligible) {
        return OptInFeatureErrorCode.Ineligible
      }
      return optInLimitedFeature(FeatureName.AIDigest, uid, MAX_AIDIGEST_USERS)
    }
    default:
      return OptInFeatureErrorCode.NotFound
  }
}

const optInLimitedFeature = async (
  featureName: string,
  uid: string,
  maxUsers: number
): Promise<Feature> => {
  const feature = await getRepository(Feature).findOne({
    where: {
      name: featureName,
      grantedAt: Not(IsNull()),
      user: { id: uid },
    },
    relations: ['user'],
  })
  if (feature) {
    // already opted in
    logger.info('already opted in')
    return feature
  }

  const optedInFeatures: Feature[] = (await appDataSource.query(
    `insert into omnivore.features (user_id, name, granted_at) 
    select $1, $2, $3 from omnivore.features 
    where name = $2 and granted_at is not null 
    having count(*) < $4 
    on conflict (user_id, name) 
    do update set granted_at = $3 
    returning *, granted_at as "grantedAt", created_at as "createdAt", updated_at as "updatedAt";`,
    [uid, featureName, new Date(), maxUsers]
  )) as Feature[]

  // if no new features were created then user has exceeded max users
  if (optedInFeatures.length === 0) {
    logger.info('exceeded max users')

    // create/update an opt-in record with null grantedAt
    const optInRecord = {
      user: { id: uid },
      name: featureName,
      grantedAt: null,
    }
    const result = await getRepository(Feature).upsert(optInRecord, [
      'user',
      'name',
    ])
    if (result.generatedMaps.length === 0) {
      throw new Error('failed to update opt-in record')
    }

    logger.info('opt-in record updated', result.generatedMaps)
    return { ...optInRecord, ...(result.generatedMaps[0] as Feature) }
  }

  logger.info('opted in', { uid, feature: optedInFeatures[0] })

  return optedInFeatures[0]
}

export const signFeatureToken = (
  feature: {
    name?: string
    grantedAt?: Date | null
  },
  userId: string
): string => {
  logger.info('signing feature token', feature)

  return jwt.sign(
    {
      uid: userId,
      featureName: feature.name,
      grantedAt: feature.grantedAt ? feature.grantedAt.getTime() / 1000 : null,
    },
    env.server.jwtSecret,
    { expiresIn: '1y' }
  )
}

export const findUserFeatures = async (userId: string) => {
  return getRepository(Feature).findBy({
    user: { id: userId },
  })
}

export const findGrantedFeatureByName = async (
  name: FeatureName,
  userId: string,
  relations?: 'user'[]
): Promise<Feature | null> => {
  return getRepository(Feature).findOne({
    where: { name, user: { id: userId }, grantedAt: Not(IsNull()) },
    relations,
  })
}

export const deleteFeature = async (
  criteria: string[] | FindOptionsWhere<Feature>
) => {
  return getRepository(Feature).delete(criteria)
}

export const createFeature = async (feature: DeepPartial<Feature>) => {
  return getRepository(Feature).save(feature)
}

export const createFeatures = async (features: DeepPartial<Feature>[]) => {
  return getRepository(Feature).save(features)
}

export const userDigestEligible = async (uid: string): Promise<boolean> => {
  const subscriptionsCount = await authTrx(
    async (tx) => {
      return tx.getRepository(Subscription).count({
        where: { user: { id: uid }, status: SubscriptionStatus.Active },
      })
    },
    {
      uid,
    }
  )

  const libraryItemsCount = await authTrx(
    async (tx) => {
      return tx.getRepository(LibraryItem).count({
        where: { user: { id: uid } },
      })
    },
    {
      uid,
    }
  )

  return subscriptionsCount >= 2 && libraryItemsCount >= 10
}
