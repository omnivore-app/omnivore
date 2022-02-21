import { authorized } from '../../utils/helpers'
import {
  CreateLabelError,
  CreateLabelErrorCode,
  CreateLabelSuccess,
  DeleteLabelError,
  DeleteLabelErrorCode,
  DeleteLabelSuccess,
  LabelsError,
  LabelsErrorCode,
  LabelsSuccess,
  MutationCreateLabelArgs,
  MutationDeleteLabelArgs,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { User } from '../../entity/user'
import { Label } from '../../entity/label'
import { getManager, getRepository } from 'typeorm'
import { setClaims } from '../../entity/utils'

export const labelsResolver = authorized<LabelsSuccess, LabelsError>(
  async (_obj, _params, { claims: { uid }, log }) => {
    log.info('labelsResolver')

    analytics.track({
      userId: uid,
      event: 'labels',
      properties: {
        env: env.server.apiEnv,
      },
    })

    try {
      const user = await User.findOne(uid, {
        relations: ['labels'],
      })
      if (!user) {
        return {
          errorCodes: [LabelsErrorCode.Unauthorized],
        }
      }

      return {
        labels: user.labels || [],
      }
    } catch (error) {
      log.error(error)
      return {
        errorCodes: [LabelsErrorCode.BadRequest],
      }
    }
  }
)

export const createLabelResolver = authorized<
  CreateLabelSuccess,
  CreateLabelError,
  MutationCreateLabelArgs
>(async (_, { input }, { claims: { uid }, log }) => {
  log.info('createLabelResolver')

  const { name, color, description } = input

  try {
    const user = await getRepository(User).findOne(uid)
    if (!user) {
      return {
        errorCodes: [CreateLabelErrorCode.Unauthorized],
      }
    }

    const existingLabel = await getRepository(Label).findOne({
      where: {
        name,
      },
    })
    if (existingLabel) {
      return {
        errorCodes: [CreateLabelErrorCode.LabelAlreadyExists],
      }
    }

    const label = await getRepository(Label)
      .create({
        user,
        name,
        color,
        description: description || '',
      })
      .save()

    analytics.track({
      userId: uid,
      event: 'createLabel',
      properties: {
        name,
        color,
        description,
        env: env.server.apiEnv,
      },
    })

    return {
      label,
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [CreateLabelErrorCode.BadRequest],
    }
  }
})

export const deleteLabelResolver = authorized<
  DeleteLabelSuccess,
  DeleteLabelError,
  MutationDeleteLabelArgs
>(async (_, { id: labelId }, { claims: { uid }, log }) => {
  log.info('deleteLabelResolver')

  try {
    const user = await getRepository(User).findOne(uid)
    if (!user) {
      return {
        errorCodes: [DeleteLabelErrorCode.Unauthorized],
      }
    }

    const label = await getRepository(Label).findOne(labelId, {
      relations: ['user'],
    })
    if (!label) {
      return {
        errorCodes: [DeleteLabelErrorCode.NotFound],
      }
    }

    if (label.user.id !== uid) {
      return {
        errorCodes: [DeleteLabelErrorCode.Unauthorized],
      }
    }

    const result = await getManager().transaction(async (t) => {
      await setClaims(t, uid)
      return t.getRepository(Label).delete(labelId)
    })
    if (!result.affected) {
      log.error('Failed to delete label', labelId)
      return {
        errorCodes: [DeleteLabelErrorCode.BadRequest],
      }
    }

    analytics.track({
      userId: uid,
      event: 'deleteLabel',
      properties: {
        labelId,
        env: env.server.apiEnv,
      },
    })

    return {
      label,
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [DeleteLabelErrorCode.BadRequest],
    }
  }
})
