import cors from 'cors'
import express from 'express'
import { Task, TaskState } from '../generated/graphql'
import { getJob, jobStateToTaskState } from '../queue-processor'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'
import { JobState } from 'bullmq'

export function taskRouter() {
  const router = express.Router()

  router.get(
    '/:id',
    cors(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = getTokenByRequest(req)
      const claims = await getClaimsByToken(token)
      if (!claims) {
        res.status(401).send('UNAUTHORIZED')
        return
      }

      try {
        const job = await getJob(req.params.id)
        if (!job || !job.id) {
          res.status(404).send('Not Found')
          return
        }

        const jobState: JobState | 'unknown' = await job.getState()
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
          failedReason:
            state === TaskState.Failed ? job.failedReason : undefined,
        }

        res.send(result)
      } catch (e) {
        logger.error('failed to get task', e)
        res.sendStatus(500)
      }
    }
  )

  router.delete('/:id', cors(corsConfig), async (req, res): Promise<void> => {
    const token = getTokenByRequest(req)
    const claims = await getClaimsByToken(token)
    if (!claims) {
      res.sendStatus(401)
      return
    }

    try {
      const job = await getJob(req.params.id)
      if (!job || !job.id) {
        logger.info('Task not found')
        res.sendStatus(404)
        return
      }

      const jobState: JobState | 'unknown' = (await job.getState()) as
        | JobState
        | 'unknown'
      if (jobState === 'active') {
        logger.error('Task is active')
        // cannot delete active task
        res.status(400).send('Task is active')
        return
      }

      // remove job
      await job.remove?.()

      if (['completed', 'failed'].includes(jobState)) {
        logger.info('Task removed')
        res.status(200).send('Task removed')
        return
      }

      // job is waiting or delayed
      logger.info('Task cancelled')
      res.status(200).send('Task cancelled')
    } catch (e) {
      logger.error('failed to delete task', e)
      res.sendStatus(500)
    }
  })

  return router
}
