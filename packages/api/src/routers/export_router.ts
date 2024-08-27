import cors from 'cors'
import express, { Router } from 'express'
import { jobStateToTaskState } from '../queue-processor'
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
      const job = await queueExportJob(userId)

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

      const jobState = await job.getState()
      res.send({
        jobId: job.id,
        state: jobStateToTaskState(jobState),
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
