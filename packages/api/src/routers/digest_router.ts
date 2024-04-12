import cors from 'cors'
import express from 'express'
import { TaskState } from '../generated/graphql'
import { CREATE_DIGEST_JOB } from '../jobs/create_digest'
import { createJobId, getJob, jobStateToTaskState } from '../queue-processor'
import { redisDataSource } from '../redis_data_source'
import { findActiveUser } from '../services/user'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueCreateDigest } from '../utils/createTask'
import { logger } from '../utils/logger'

interface Digest {
  url: string
  title: string
  jobState: string
  content: string
  chapters: Chapter[]
  urlsToAudio: string[]
}

interface Chapter {
  title: string
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
      const key = `digest:${userId}`
      const digest = await redisDataSource.redisClient?.get(key)
      if (!digest) {
        logger.info(`Digest not found: ${key}`)
        return res.sendStatus(404)
      }

      const digestObject = JSON.parse(digest) as Digest

      // return digest
      return res.send({
        ...digestObject,
        jobId,
        jobState: TaskState.Succeeded,
      })
    } catch (error) {
      logger.error('Error while getting digest', error)
      return res.sendStatus(500)
    }
  })

  return router
}
