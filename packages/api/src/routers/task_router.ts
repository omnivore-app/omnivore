import cors from 'cors'
import express from 'express'
import { Task, TaskState } from '../generated/graphql'
import { getJob, jobStateToTaskState } from '../queue-processor'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'

export function taskRouter() {
  const router = express.Router()

  router.get('/:id', cors<express.Request>(corsConfig), async (req, res) => {
    const token = getTokenByRequest(req)
    const claims = await getClaimsByToken(token)
    if (!claims) {
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      const job = await getJob(req.params.id)
      if (!job || !job.id) {
        res.status(404).send('Not Found')
        return
      }

      const jobState = await job.getState()
      const state = jobStateToTaskState(jobState)
      const finishedAt = job.finishedOn ? job.finishedOn : Date.now()
      const runningTime = job.processedOn ? finishedAt - job.processedOn : 0

      const result: Task = {
        id: job.id,
        state,
        createdAt: new Date(job.timestamp),
        name: job.name,
        runningTime,
        progress: job.progress as number,
        failedReason: state === TaskState.Failed ? job.failedReason : undefined,
      }

      res.send(result)
    } catch (e) {
      logger.error('failed to get task', e)
      res.status(500)
    }
  })

  return router
}
