import cors from 'cors'
import express, { Router } from 'express'
import { TaskState } from '../generated/graphql'
import { jobStateToTaskState } from '../queue-processor'
import { countExportsWithin24Hours, saveExport } from '../services/export'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { queueExportJob } from '../utils/createTask'
import { logger } from '../utils/logger'

export function exportRouter() {
  const router = Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/', cors<express.Request>(corsConfig), async (req, res) => {
    const token = getTokenByRequest(req)
    // get claims from token
    const claims = await getClaimsByToken(token)
    if (!claims) {
      logger.error('Token not found')
      return res.status(401).send({
        error: 'UNAUTHORIZED',
      })
    }

    // get user by uid from claims
    const userId = claims.uid

    try {
      const exportsWithin24Hours = await countExportsWithin24Hours(userId)
      if (exportsWithin24Hours >= 3) {
        logger.error('User has reached the limit of exports within 24 hours', {
          userId,
          exportsWithin24Hours,
        })
        return res.status(400).send({
          error: 'EXPORT_LIMIT_REACHED',
        })
      }

      const exportTask = await saveExport(userId, {
        state: TaskState.Pending,
      })

      const job = await queueExportJob(userId, exportTask.id)

      if (!job || !job.id) {
        logger.error('Failed to queue export job', {
          userId,
        })
        return res.status(500).send({
          error: 'INTERNAL_ERROR',
        })
      }

      logger.info('Export job queued', {
        userId,
        jobId: job.id,
      })

      const taskId = job.id
      const jobState = await job.getState()
      const state = jobStateToTaskState(jobState)
      await saveExport(userId, {
        id: exportTask.id,
        taskId,
        state,
      })

      res.send({
        taskId,
        state,
      })
    } catch (error) {
      logger.error('Error exporting all items', {
        userId,
        error,
      })
      return res.status(500).send({
        error: 'INTERNAL_ERROR',
      })
    }
  })

  return router
}
