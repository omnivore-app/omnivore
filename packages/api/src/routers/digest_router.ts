import cors from 'cors'
import express from 'express'
import { env } from '../env'
import { TaskState } from '../generated/graphql'
import {
  CreateDigestJobSchedule,
  moveDigestToLibrary,
} from '../jobs/ai/create_digest'
import { deleteDigest, getDigest } from '../services/digest'
import { FeatureName, findGrantedFeatureByName } from '../services/features'
import { analytics } from '../utils/analytics'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { enqueueCreateDigest, removeDigestJobs } from '../utils/createTask'
import { logger } from '../utils/logger'

interface Feedback {
  digestRating: number
  rankingModels: string[]
  rankingRating: number
  summaryRating: number
  summaryModels: string[]
  voiceRating: number
  musicRating: number
  comment?: string
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

interface CreateDigestRequest {
  voices?: string[]
  language?: string
  rate?: string
  schedule?: CreateDigestJobSchedule
  libraryItemIds?: string[]
}

export function digestRouter(): express.Router {
  const router = express.Router()

  router.options('/v1', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  // v1 version of create digest api
  router.post(
    '/v1',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = getTokenByRequest(req)

      let userId: string
      try {
        // get claims from token
        const claims = await getClaimsByToken(token)
        if (!claims) {
          logger.info('Token not found')
          res.status(401).send({
            error: 'UNAUTHORIZED',
          })
          return
        }

        // get user by uid from claims
        if (!claims) {
          res.status(401).send({
            error: 'UNAUTHORIZED',
          })
          return
        }
        userId = claims.uid
      } catch (error) {
        logger.info('Error while getting claims from token', error)
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
        return
      }

      try {
        const feature = await findGrantedFeatureByName(
          FeatureName.AIDigest,
          userId
        )
        if (!feature) {
          logger.info(`${FeatureName.AIDigest} not granted: ${userId}`)
          res.status(403).send({
            error: 'FORBIDDEN',
          })
          return
        }

        const data = req.body as CreateDigestRequest
        logger.info(`Creating digest: ${JSON.stringify(data)}`)

        // check if job is running
        // if yes then return 202 accepted
        // else enqueue job
        const digest = await getDigest(userId)
        if (digest?.jobState === TaskState.Running) {
          logger.info(`Digest job is running: ${userId}`)
          res.status(202).send(digest)
          return
        }

        // remove existing digest jobs
        await removeDigestJobs(userId)

        // enqueue job and return job id
        const result = await enqueueCreateDigest(
          {
            userId,
            voices: data.voices,
            language: data.language,
            rate: data.rate,
            libraryItemIds: data.libraryItemIds,
          },
          data.schedule
        )

        // return job id
        res.status(201).send(result)
        return
      } catch (error) {
        logger.error('Error while enqueuing create digest task', error)
        res.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
        })
        return
      }
    }
  )

  // v1 version of get digest api
  router.get(
    '/v1',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = getTokenByRequest(req)

      // get claims from token
      let claims
      try {
        claims = await getClaimsByToken(token)
        if (!claims) {
          logger.info('Token not found')
          res.status(401).send({
            error: 'UNAUTHORIZED',
          })
          return
        }
      } catch (error) {
        logger.info('Error while getting claims from token', error)
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
        return
      }

      const userId = claims.uid
      try {
        const feature = await findGrantedFeatureByName(
          FeatureName.AIDigest,
          userId
        )
        if (!feature) {
          logger.info(`${FeatureName.AIDigest} not granted: ${userId}`)
          res.status(403).send({
            error: 'FORBIDDEN',
          })
          return
        }

        // get the digest from redis
        const digest = await getDigest(userId)
        if (!digest) {
          logger.info(`Digest not found: ${userId}`)
          res.status(404).send({
            error: 'NOT_FOUND',
          })
          return
        }

        if (digest.jobState === TaskState.Failed) {
          logger.error(`Digest job failed: ${userId}`)
          res.status(500).send({
            error: 'INTERNAL_SERVER_ERROR',
          })
          return
        }

        res.send(digest)
      } catch (error) {
        logger.error('Error while getting digest', error)
        res.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
        })
      }
    }
  )

  router.options(
    '/v1/feedback',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  // v1 version of sending feedback api
  router.post(
    '/v1/feedback',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const token = getTokenByRequest(req)

      // Initialize userId with a type but no value yet
      let userId: string

      try {
        // get claims from token
        const claims = await getClaimsByToken(token)
        if (!claims) {
          logger.info('Token not found')
          res.status(401).send({
            error: 'UNAUTHORIZED',
          })
          return // Add return to prevent further execution
        }

        // get user by uid from claims
        userId = claims.uid
      } catch (error) {
        logger.info('Error while getting claims from token', error)
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
        return // Add return to prevent further execution
      }

      try {
        const feature = await findGrantedFeatureByName(
          FeatureName.AIDigest,
          userId
        )
        if (!feature) {
          logger.info(`${FeatureName.AIDigest} not granted: ${userId}`)
          res.status(403).send({
            error: 'FORBIDDEN',
          })
          return // Add return to prevent further execution
        }

        // get feedback from request body
        if (!isFeedback(req.body)) {
          logger.info('Invalid feedback format')
          res.status(400).send({
            error: 'INVALID_REQUEST_BODY',
          })
          return // Add return to prevent further execution
        }

        const feedback = req.body
        logger.info(`Sending feedback: ${JSON.stringify(feedback)}`)

        // remove comment from feedback before sending to analytics
        delete feedback.comment
        // send feedback to analytics
        analytics.capture({
          distinctId: userId,
          event: 'digest_feedback',
          properties: {
            ...feedback,
            env: env.server.apiEnv,
          },
        })

        //  success
        res.send({
          success: true,
        })
      } catch (error) {
        logger.error('Error while saving feedback', error)
        res.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
        })
      }
    }
  )

  router.options(
    '/v1/move',
    cors<express.Request>({ ...corsConfig, maxAge: 600 })
  )
  // v1 version of move digest to library api
  router.post(
    '/v1/move',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = getTokenByRequest(req)

      // get claims from token
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('Token not found')
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
        return
      }

      const userId = claims.uid

      try {
        const feature = await findGrantedFeatureByName(
          FeatureName.AIDigest,
          userId,
          ['user']
        )
        if (!feature) {
          logger.info(`${FeatureName.AIDigest} not granted: ${userId}`)
          res.status(403).send({
            error: 'FORBIDDEN',
          })
          return
        }

        // get the digest from redis
        const digest = await getDigest(userId)
        if (!digest) {
          logger.info(`Digest not found: ${userId}`)
          res.status(404).send({
            error: 'NOT_FOUND',
          })
          return
        }

        // move digest to library
        await moveDigestToLibrary(feature.user, digest)

        res.send({
          success: true,
        })
      } catch (error) {
        logger.error('Error while moving digest to library', error)
        res.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
        })
      }
    }
  )

  // v1 version of delete digest api
  router.delete(
    '/v1',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const token = getTokenByRequest(req)
      // get claims from token
      const claims = await getClaimsByToken(token)
      if (!claims) {
        logger.error('Token not found')
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
      }

      // get user by uid from claims
      if (!claims) {
        logger.error('Claims are undefined')
        res.status(401).send({
          error: 'UNAUTHORIZED',
        })
        return
      }
      const userId = claims.uid

      try {
        const feature = await findGrantedFeatureByName(
          FeatureName.AIDigest,
          userId
        )
        if (!feature) {
          logger.info(`${FeatureName.AIDigest} not granted: ${userId}`)
          res.status(403).send({
            error: 'FORBIDDEN',
          })
        }

        // cancel and remove the digest job
        await removeDigestJobs(userId)
        logger.info(`Digest job removed: ${userId}`)

        // delete digest
        await deleteDigest(userId)
        logger.info(`Digest deleted: ${userId}`)

        res.send({
          success: true,
        })
      } catch (error) {
        logger.error('Error while deleting digest', error)
        res.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
        })
      }
    }
  )

  return router
}
