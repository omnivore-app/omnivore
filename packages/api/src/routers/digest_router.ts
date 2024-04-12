import cors from 'cors'
import express from 'express'
import { CREATE_DIGEST_JOB } from '../jobs/create_digest'
import { createJobId, getJob } from '../queue-processor'
import { findActiveUser } from '../services/user'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueCreateDigest } from '../utils/createTask'
import { logger } from '../utils/logger'

export function digestRouter() {
  const router = express.Router()

  // v1 version of create digest api
  router.post(
    '/v1',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res) => {
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

      const user = await findActiveUser(userId)
      if (!user) {
        logger.info(`User not found: ${userId}`)
        return res.sendStatus(401)
      }

      try {
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
    }
  )

  return router
}
