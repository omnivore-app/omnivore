import {
  MutationOptInFeatureArgs,
  OptInFeatureError,
  OptInFeatureErrorCode,
  OptInFeatureSuccess,
} from '../../generated/graphql'
import {
  getFeatureName,
  optInFeature,
  signFeatureToken,
} from '../../services/features'
import { authorized } from '../../utils/helpers'

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

    const optedInFeature = await optInFeature(featureName, claims.uid)
    if (!optedInFeature) {
      return {
        errorCodes: [OptInFeatureErrorCode.NotFound],
      }
    }
    log.info('Opted in to a feature', optedInFeature)

    const token = signFeatureToken(optedInFeature, claims.uid)

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
