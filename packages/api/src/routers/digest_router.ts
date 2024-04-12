import cors from 'cors'
import express from 'express'
import { TaskState } from '../generated/graphql'
import { CREATE_DIGEST_JOB } from '../jobs/create_digest'
import { createJobId, getJob, jobStateToTaskState } from '../queue-processor'
import { getDigest } from '../services/digest'
import { findActiveUser } from '../services/user'
import { analytics } from '../utils/analytics'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueCreateDigest } from '../utils/createTask'
import { logger } from '../utils/logger'

interface Feedback {
  digestRating: number
  rankingRating: number
  summaryRating: number
  voiceRating: number
  musicRating: number
}

const isFeedback = (data: any): data is Feedback => {
  return (
    'digestRating' in data &&
    'rankingRating' in data &&
    'summaryRating' in data &&
    'voiceRating' in data &&
    'musicRating' in data
  )
}

export function digestRouter() {
  const router = express.Router()

  // v1 version of create digest api
  router.post('/v1', cors<express.Request>(corsConfig), async (req, res) => {
    const token = getTokenByRequest(req)

    let userId: string
    try {
      // get claims from token
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('Token not found')
        return res.sendStatus(401)
      }

      // get user by uid from claims
      userId = claims.uid
    } catch (error) {
      logger.info('Error while getting claims from token', error)
      return res.sendStatus(401)
    }

    try {
      const user = await findActiveUser(userId)
      if (!user) {
        logger.info(`User not found: ${userId}`)
        return res.sendStatus(401)
      }

      // check if job is already in queue
      // if yes then return 409 conflict
      // else enqueue job
      const jobId = createJobId(userId, CREATE_DIGEST_JOB)
      const existingJob = await getJob(jobId)
      if (existingJob) {
        logger.info(`Job already in queue: ${jobId}`)
        return res.sendStatus(409)
      }

      // enqueue job and return job id
      const result = await enqueueCreateDigest({
        userId,
      })

      // return job id
      return res.status(200).send(result)
    } catch (error) {
      logger.error('Error while enqueuing create digest task', error)
      return res.sendStatus(500)
    }
  })

  // v1 version of get digest api
  router.get('/v1', cors<express.Request>(corsConfig), async (req, res) => {
    const token = getTokenByRequest(req)

    let userId: string
    try {
      // get claims from token
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('Token not found')
        return res.sendStatus(401)
      }

      // get user by uid from claims
      userId = claims.uid
    } catch (error) {
      logger.info('Error while getting claims from token', error)
      return res.sendStatus(401)
    }

    try {
      const user = await findActiveUser(userId)
      if (!user) {
        logger.info(`User not found: ${userId}`)
        return res.sendStatus(401)
      }

      // get job by user id
      const jobId = createJobId(userId, CREATE_DIGEST_JOB)
      const job = await getJob(jobId)
      if (job) {
        // if job is in queue then return job state
        const jobState = await job.getState()
        return res.send({
          jobId: job.id,
          jobState: jobStateToTaskState(jobState),
        })
      }

      // if job is done and removed then get the digest from redis
      const digest = await getDigest(userId)
      if (!digest) {
        logger.info(`Digest not found: ${userId}`)
        return res.sendStatus(404)
      }

      // return digest
      return res.send({
        ...digest,
        jobId,
        jobState: TaskState.Succeeded,
      })
    } catch (error) {
      logger.error('Error while getting digest', error)
      return res.sendStatus(500)
    }
  })

  // v1 version of sending feedback api
  router.post(
    '/v1/feedback',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const token = getTokenByRequest(req)

      let userId: string
      try {
        // get claims from token
        const claims = await getClaimsByToken(token)
        if (!claims) {
          logger.info('Token not found')
          return res.sendStatus(401)
        }

        // get user by uid from claims
        userId = claims.uid
      } catch (error) {
        logger.info('Error while getting claims from token', error)
        return res.sendStatus(401)
      }

      try {
        const user = await findActiveUser(userId)
        if (!user) {
          logger.info(`User not found: ${userId}`)
          return res.sendStatus(401)
        }

        // get feedback from request body
        if (!isFeedback(req.body)) {
          logger.info('Invalid feedback format')
          return res.sendStatus(400)
        }

        const feedback = req.body
        // send feedback to analytics
        logger.info(`Sending feedback: ${JSON.stringify(feedback)}`)

        analytics.capture({
          distinctId: userId,
          event: 'digest_feedback',
          properties: feedback,
        })

        // return success
        return res.sendStatus(200)
      } catch (error) {
        logger.error('Error while saving feedback', error)
        return res.sendStatus(500)
      }
    }
  )

  return router
}
