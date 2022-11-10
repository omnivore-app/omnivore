import { Feature } from '../entity/feature'
import { getRepository } from '../entity/utils'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { IsNull, Not } from 'typeorm'

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
    },
    relations: ['user'],
  })
  if (feature) {
    // already opted in
    console.log('already opted in')
    return feature
  }

  // opt in to feature for the first 1000 users
  const count = await getRepository(Feature).countBy({
    name: FeatureName.UltraRealisticVoice,
    grantedAt: Not(IsNull()),
  })

  let grantedAt: Date | null = new Date()
  if (count >= 1000) {
    console.log('feature limit reached')
    grantedAt = null
  }

  return getRepository(Feature).save({
    user: { id: uid },
    name: FeatureName.UltraRealisticVoice,
    grantedAt,
  })
}

export const signFeatureToken = (
  feature: {
    name?: string
    grantedAt?: Date | null
  },
  userId: string
): string => {
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
