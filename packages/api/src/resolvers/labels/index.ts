import { Between } from 'typeorm'
import { createPubSubClient } from '../../datalayer/pubsub'
import { getHighlightById } from '../../elastic/highlights'
import {
  deleteLabel,
  setLabelsForHighlight,
  updateLabel,
  updateLabelsInPage,
} from '../../elastic/labels'
import { getPageById } from '../../elastic/pages'
import { Label } from '../../entity/label'
import { User } from '../../entity/user'
import { getRepository, setClaims } from '../../entity/utils'
import { env } from '../../env'
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
  MoveLabelError,
  MoveLabelErrorCode,
  MoveLabelSuccess,
  MutationCreateLabelArgs,
  MutationDeleteLabelArgs,
  MutationMoveLabelArgs,
  MutationSetLabelsArgs,
  MutationSetLabelsForHighlightArgs,
  MutationUpdateLabelArgs,
  SetLabelsError,
  SetLabelsErrorCode,
  SetLabelsSuccess,
  UpdateLabelError,
  UpdateLabelErrorCode,
  UpdateLabelSuccess,
} from '../../generated/graphql'
import { AppDataSource } from '../../server'
import {
  createLabel,
  createLabels,
  getLabelByName,
  getLabelsByIds,
} from '../../services/labels'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/helpers'

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
      const user = await getRepository(User).findOne({
        where: { id: uid },
        relations: ['labels'],
        order: {
          labels: {
            position: 'ASC',
          },
        },
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

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [CreateLabelErrorCode.Unauthorized],
      }
    }

    // Check if label already exists ignoring case of name
    const existingLabel = await getLabelByName(uid, input.name)
    if (existingLabel) {
      return {
        errorCodes: [CreateLabelErrorCode.LabelAlreadyExists],
      }
    }

    const label = await createLabel(uid, input)

    analytics.track({
      userId: uid,
      event: 'label_created',
      properties: {
        ...input,
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
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [DeleteLabelErrorCode.Unauthorized],
      }
    }

    const label = await getRepository(Label).findOne({
      where: { id: labelId, user: { id: uid } },
      relations: ['user'],
    })
    if (!label) {
      return {
        errorCodes: [DeleteLabelErrorCode.NotFound],
      }
    }

    // internal labels cannot be deleted
    if (label.internal) {
      log.info('internal labels cannot be deleted')
      return {
        errorCodes: [DeleteLabelErrorCode.Forbidden],
      }
    }

    const result = await AppDataSource.transaction(async (t) => {
      await setClaims(t, uid)
      return t.getRepository(Label).delete(labelId)
    })
    if (!result.affected) {
      log.error('Failed to delete label', labelId)
      return {
        errorCodes: [DeleteLabelErrorCode.BadRequest],
      }
    }

    // delete label in elastic pages and highlights
    await deleteLabel(label.name, {
      pubsub: createPubSubClient(),
      uid,
      refresh: true,
    })

    analytics.track({
      userId: uid,
      event: 'label_deleted',
      properties: {
        labelId,
        env: env.server.apiEnv,
      },
    })

    return {
      label,
    }
  } catch (error) {
    log.error('error deleting label', error)
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

  const { pageId, labelIds, labels } = input

  if (!labelIds && !labels) {
    log.info('labelIds or labels must be provided')
    return {
      errorCodes: [SetLabelsErrorCode.BadRequest],
    }
  }

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
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
    if (page.userId !== uid) {
      return {
        errorCodes: [SetLabelsErrorCode.Unauthorized],
      }
    }

    const ctx = {
      uid,
      pubsub,
      refresh: true,
    }
    let labelsSet: Label[] = []

    if (labels && labels.length > 0) {
      // for new clients that send label names
      // create labels if they don't exist
      labelsSet = await createLabels(ctx, labels)
    } else if (labelIds && labelIds.length > 0) {
      // for old clients that send labelIds
      labelsSet = await getLabelsByIds(uid, labelIds)
      if (labelsSet.length !== labelIds.length) {
        return {
          errorCodes: [SetLabelsErrorCode.NotFound],
        }
      }
    }
    // filter out labels that are already set
    const labelsToAdd = labelsSet.filter(
      (label) => !page.labels?.some((pageLabel) => pageLabel.id === label.id)
    )
    // update labels in the page
    const updated = await updateLabelsInPage(
      pageId,
      labelsSet,
      ctx,
      labelsToAdd
    )
    if (!updated) {
      return {
        errorCodes: [SetLabelsErrorCode.NotFound],
      }
    }

    analytics.track({
      userId: uid,
      event: 'labels_set',
      properties: {
        pageId,
        labelIds,
        env: env.server.apiEnv,
      },
    })

    return {
      labels: labelsSet,
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [SetLabelsErrorCode.BadRequest],
    }
  }
})

export const updateLabelResolver = authorized<
  UpdateLabelSuccess,
  UpdateLabelError,
  MutationUpdateLabelArgs
>(async (_, { input }, { claims: { uid }, log, pubsub }) => {
  log.info('updateLabelResolver')

  try {
    const { name, color, description, labelId } = input
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [UpdateLabelErrorCode.Unauthorized],
      }
    }

    const label = await getRepository(Label).findOne({
      where: { id: labelId, user: { id: uid } },
      select: ['id', 'name', 'color', 'description', 'createdAt'],
    })
    if (!label) {
      return {
        errorCodes: [UpdateLabelErrorCode.NotFound],
      }
    }

    // internal labels cannot be updated
    if (label.internal && label.name.toLowerCase() !== name.toLowerCase()) {
      log.info('internal labels cannot be updated')

      return {
        errorCodes: [UpdateLabelErrorCode.Forbidden],
      }
    }

    log.info('Updating a label', {
      labels: {
        source: 'resolver',
        resolver: 'updateLabelResolver',
      },
    })

    const result = await AppDataSource.transaction(async (t) => {
      await setClaims(t, uid)
      label.name = name
      label.color = color
      label.description = description || undefined
      label.createdAt = new Date()

      return t.getRepository(Label).update({ id: labelId }, label)
    })

    if (!result.affected) {
      log.error('failed to update')
      return {
        errorCodes: [UpdateLabelErrorCode.BadRequest],
      }
    }

    await updateLabel(label, {
      pubsub,
      uid,
      refresh: true,
    })

    return { label }
  } catch (error) {
    log.error('error updating label', error)
    return {
      errorCodes: [UpdateLabelErrorCode.BadRequest],
    }
  }
})

export const setLabelsForHighlightResolver = authorized<
  SetLabelsSuccess,
  SetLabelsError,
  MutationSetLabelsForHighlightArgs
>(async (_, { input }, { claims: { uid }, log, pubsub }) => {
  log.info('setLabelsForHighlightResolver')

  const { highlightId, labelIds, labels } = input

  if (!labelIds && !labels) {
    log.info('labelIds or labels must be provided')
    return {
      errorCodes: [SetLabelsErrorCode.BadRequest],
    }
  }

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [SetLabelsErrorCode.Unauthorized],
      }
    }

    const highlight = await getHighlightById(highlightId)
    if (!highlight) {
      return {
        errorCodes: [SetLabelsErrorCode.NotFound],
      }
    }
    if (highlight.userId !== uid) {
      return {
        errorCodes: [SetLabelsErrorCode.Unauthorized],
      }
    }

    const ctx = {
      uid,
      pubsub,
      refresh: true,
    }
    let labelsSet: Label[] = []
    if (labels && labels.length > 0) {
      // for new clients that send label names
      // create labels if they don't exist
      labelsSet = await createLabels(ctx, labels)
    } else if (labelIds && labelIds.length > 0) {
      // for old clients that send labelIds
      labelsSet = await getLabelsByIds(uid, labelIds)
      if (labelsSet.length !== labelIds.length) {
        return {
          errorCodes: [SetLabelsErrorCode.NotFound],
        }
      }
    }
    // filter out labels that are already set
    const labelsToAdd = labelsSet.filter(
      (label) =>
        !highlight.labels?.some(
          (highlightLabel) => highlightLabel.id === label.id
        )
    )
    // set labels in the highlights
    const updated = await setLabelsForHighlight(
      highlightId,
      labelsSet,
      ctx,
      labelsToAdd
    )
    if (!updated) {
      return {
        errorCodes: [SetLabelsErrorCode.NotFound],
      }
    }

    analytics.track({
      userId: uid,
      event: 'labels_set_for_highlight',
      properties: {
        highlightId,
        labelIds,
        env: env.server.apiEnv,
      },
    })

    return {
      labels: labelsSet,
    }
  } catch (error) {
    log.error(error)
    return {
      errorCodes: [SetLabelsErrorCode.BadRequest],
    }
  }
})

export const moveLabelResolver = authorized<
  MoveLabelSuccess,
  MoveLabelError,
  MutationMoveLabelArgs
>(async (_, { input }, { claims: { uid }, log, pubsub }) => {
  log.info('moveLabelResolver')

  const { labelId, afterLabelId } = input

  try {
    const user = await getRepository(User).findOneBy({ id: uid })
    if (!user) {
      return {
        errorCodes: [MoveLabelErrorCode.Unauthorized],
      }
    }

    const label = await getRepository(Label).findOne({
      where: { id: labelId },
      relations: ['user'],
    })
    if (!label) {
      return {
        errorCodes: [MoveLabelErrorCode.NotFound],
      }
    }
    if (label.user.id !== uid) {
      return {
        errorCodes: [MoveLabelErrorCode.Unauthorized],
      }
    }

    if (label.id === afterLabelId) {
      // nothing to do
      return { label }
    }

    const oldPosition = label.position
    // if afterLabelId is not provided, move to the top
    let newPosition = 1
    if (afterLabelId) {
      const afterLabel = await getRepository(Label).findOne({
        where: { id: afterLabelId },
        relations: ['user'],
      })
      if (!afterLabel) {
        return {
          errorCodes: [MoveLabelErrorCode.NotFound],
        }
      }
      if (afterLabel.user.id !== uid) {
        return {
          errorCodes: [MoveLabelErrorCode.Unauthorized],
        }
      }
      newPosition = afterLabel.position
    }
    const moveUp = newPosition < oldPosition

    // move label to the new position
    const updated = await AppDataSource.transaction(async (t) => {
      await setClaims(t, uid)

      // update the position of the other labels
      const updated = await t.getRepository(Label).update(
        {
          user: { id: uid },
          position: Between(
            Math.min(newPosition, oldPosition),
            Math.max(newPosition, oldPosition)
          ),
        },
        {
          position: () => `position + ${moveUp ? 1 : -1}`,
        }
      )
      if (!updated.affected) {
        return null
      }

      // update the position of the label
      return t.getRepository(Label).save({
        ...label,
        position: newPosition,
      })
    })

    if (!updated) {
      return {
        errorCodes: [MoveLabelErrorCode.BadRequest],
      }
    }

    analytics.track({
      userId: uid,
      event: 'label_moved',
      properties: {
        labelId,
        afterLabelId,
        env: env.server.apiEnv,
      },
    })

    return {
      label: updated,
    }
  } catch (error) {
    log.error('error moving label', error)
    return {
      errorCodes: [MoveLabelErrorCode.BadRequest],
    }
  }
})
