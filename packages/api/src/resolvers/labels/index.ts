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
  MutationSetLabelsArgs,
  SetLabelsError,
  SetLabelsErrorCode,
  SetLabelsSuccess,
} from '../../generated/graphql'
import { analytics } from '../../utils/analytics'
import { env } from '../../env'
import { User } from '../../entity/user'
import { Label } from '../../entity/label'
import { getManager, getRepository, ILike } from 'typeorm'
import { setClaims } from '../../entity/utils'
import { deleteLabelInPages, getPageById, updatePage } from '../../elastic'
import { createPubSubClient } from '../../datalayer/pubsub'

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

    // Check if label already exists ignoring case of name
    const existingLabel = await getRepository(Label).findOne({
      where: {
        user,
        name: ILike(name),
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

    // delete label in elastic pages
    await deleteLabelInPages(uid, label.name, {
      pubsub: createPubSubClient(),
      uid,
    })

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
    log.error('error', error)
    return {
      errorCodes: [DeleteLabelErrorCode.BadRequest],
    }
  }
})

export const setLabelsResolver = authorized<
  SetLabelsSuccess,
  SetLabelsError,
  MutationSetLabelsArgs
>(async (_, { input }, { claims: { uid }, log, pubsub }) => {
  log.info('setLabelsResolver')

  const { linkId: pageId, labelIds } = input

  try {
    const user = await getRepository(User).findOne(uid)
    if (!user) {
      return {
        errorCodes: [SetLabelsErrorCode.Unauthorized],
      }
    }

    const page = await getPageById(pageId)
    if (!page) {
      return {
        errorCodes: [SetLabelsErrorCode.NotFound],
      }
    }

    const labels = await getRepository(Label).findByIds(labelIds, {
      where: {
        user,
      },
      relations: ['user'],
    })
    if (labels.length !== labelIds.length) {
      return {
        errorCodes: [SetLabelsErrorCode.NotFound],
      }
    }

    // update labels in the page
    await updatePage(
      pageId,
      {
        labels,
      },
      { pubsub, uid }
    )

    analytics.track({
      userId: uid,
      event: 'setLabels',
      properties: {
        pageId,
        labelIds,
        env: env.server.apiEnv,
      },
    })

    return {
      labels,
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [SetLabelsErrorCode.BadRequest],
    }
  }
})
