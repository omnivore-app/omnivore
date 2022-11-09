import { authorized } from '../../utils/helpers'
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

    const optIn = await optInFeature(featureName, claims.uid)
    if (!optIn) {
      return {
        errorCodes: [OptInFeatureErrorCode.NotFound],
      }
    }

    const token = signFeatureToken(optIn)
    console.log('token', token)

    return {
      feature: {
        ...optIn,
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
