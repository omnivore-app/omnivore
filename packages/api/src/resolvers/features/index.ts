import {
  MutationOptInFeatureArgs,
  OptInFeatureError,
  OptInFeatureErrorCode,
  OptInFeatureSuccess,
} from '../../generated/graphql'
import {
  getFeatureName,
  getFeaturesCache,
  isOptInFeatureErrorCode,
  optInFeature,
  setFeaturesCache,
  signFeatureToken,
} from '../../services/features'
import { authorized } from '../../utils/gql-utils'

export const optInFeatureResolver = authorized<
  OptInFeatureSuccess,
  OptInFeatureError,
  MutationOptInFeatureArgs
>(async (_, { input: { name } }, { claims, log }) => {
  log.info('Opting in to a feature', {
    feature: name,
    labels: {
      source: 'resolver',
      resolver: 'optInFeatureResolver',
      uid: claims.uid,
    },
  })

  try {
    const featureName = getFeatureName(name)
    if (!featureName) {
      return {
        errorCodes: [OptInFeatureErrorCode.NotFound],
      }
    }

    const userId = claims.uid
    const optedInFeature = await optInFeature(featureName, userId)
    if (isOptInFeatureErrorCode(optedInFeature)) {
      return {
        errorCodes: [optedInFeature],
      }
    }
    log.info('Opted in to a feature', optedInFeature)

    const cachedFeatures = (await getFeaturesCache(userId)) || []
    const updatedFeatures = [...cachedFeatures, optedInFeature]
    await setFeaturesCache(userId, updatedFeatures)

    const token = signFeatureToken(optedInFeature, userId)

    return {
      feature: {
        ...optedInFeature,
        token,
      },
    }
  } catch (e) {
    log.error('Error opting in to a feature', {
      error: e,
    })

    return {
      errorCodes: [OptInFeatureErrorCode.BadRequest],
    }
  }
})
