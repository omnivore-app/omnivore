import * as jwt from 'jsonwebtoken'
import { IsNull, Not } from 'typeorm'
import { getRepository } from '../entity'
import { Feature } from '../entity/feature'
import { env } from '../env'
import { AppDataSource } from '../server'
import { logger } from '../utils/logger'

export enum FeatureName {
  UltraRealisticVoice = 'ultra-realistic-voice',
}

export const getFeatureName = (name: string): FeatureName | undefined => {
  return Object.values(FeatureName).find((v) => v === name)
}

export const optInFeature = async (
  name: FeatureName,
  uid: string
): Promise<Feature | undefined> => {
  if (name === FeatureName.UltraRealisticVoice) {
    return optInUltraRealisticVoice(uid)
  }

  return undefined
}

const optInUltraRealisticVoice = async (uid: string): Promise<Feature> => {
  const feature = await getRepository(Feature).findOne({
    where: {
      user: { id: uid },
      name: FeatureName.UltraRealisticVoice,
      grantedAt: Not(IsNull()),
    },
    relations: ['user'],
  })
  if (feature) {
    // already opted in
    logger.info('already opted in')
    return feature
  }

  const MAX_USERS = 1500
  // opt in to feature for the first 1500 users
  const optedInFeatures = (await AppDataSource.query(
    `insert into omnivore.features (user_id, name, granted_at) 
    select $1, $2, $3 from omnivore.features 
    where name = $2 and granted_at is not null 
    having count(*) < $4 
    on conflict (user_id, name) 
    do update set granted_at = $3 
    returning *, granted_at as "grantedAt", created_at as "createdAt", updated_at as "updatedAt";`,
    [uid, FeatureName.UltraRealisticVoice, new Date(), MAX_USERS]
  )) as Feature[]

  // if no new features were created then user has exceeded max users
  if (optedInFeatures.length === 0) {
    logger.info('exceeded max users')

    // create/update an opt-in record with null grantedAt
    const optInRecord = {
      user: { id: uid },
      name: FeatureName.UltraRealisticVoice,
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

export const isOptedIn = async (
  name: FeatureName,
  uid: string
): Promise<boolean> => {
  const feature = await getRepository(Feature).findOneBy({
    user: { id: uid },
    name,
    grantedAt: Not(IsNull()),
  })

  return !!feature
}

export const getFeature = async (
  name: FeatureName,
  uid: string
): Promise<Feature | null> => {
  return getRepository(Feature).findOneBy({
    user: { id: uid },
    name,
  })
}
