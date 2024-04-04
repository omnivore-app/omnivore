/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { htmlToSpeechFile } from '@omnivore/text-to-speech-handler'
import cors from 'cors'
import express from 'express'
import { userRepository } from '../repository/user'
import { getClaimsByToken } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { getAIResult } from '../services/ai-summaries'
import { AITaskRequest, AITaskResult } from '../entity/ai_tasks'
import { authTrx } from '../repository'
import { enqueueAITaskJob } from '../utils/createTask'

export function aiTaskRouter() {
  const router = express.Router()

  // Create an explain request, this will return an IDX to lookup the
  // result text
  router.post('/', cors<express.Request>(corsConfig), async (req, res) => {
    const token = req?.cookies?.auth || req?.headers?.authorization
    console.log('user token:" ', token)
    const claims = await getClaimsByToken(token)
    if (!claims) {
      return res.status(401).send('UNAUTHORIZED')
    }
    const { uid } = claims
    const user = await userRepository.findById(uid)
    if (!user) {
      return res.status(400).send('Bad Request')
    }
    const libraryItemId = req.body.libraryItemId
    const promptName = req.body.promptName
    const extraText = req.body.extraText

    console.log('making ai task request', libraryItemId, promptName, extraText)

    if (!libraryItemId || !promptName) {
      res.status(400).send('missing params')
      return
    }

    // 1. Check to see if we already have a result for these params
    // -- return the request task ID for any of the above
    // -- client can then query for the result based on the task ID
    const existingTaskRequest = await authTrx(
      async (t) => {
        return await t.getRepository(AITaskRequest).findOne({
          where: {
            user: { id: uid },
            libraryItem: { id: libraryItemId },
            prompt: { name: promptName },
            extraText,
          },
        })
      },
      undefined,
      uid
    )

    console.log('found existingTaskRequest', existingTaskRequest)

    // Check to see if there is already a request
    if (existingTaskRequest) {
      return res.status(201).send({
        requestId: existingTaskRequest.id,
      })
    }

    // There is a bit of a race condition here where another task could be
    // created with the same, but it's done this way to keep things simple
    // for now.

    const aiTaskRequest = await authTrx(
      async (t) => {
        return await t.getRepository(AITaskRequest).save({
          user: { id: uid },
          prompt: { name: promptName },
          libraryItem: { id: libraryItemId },
          extraText,
        })
      },
      undefined,
      uid
    )

    if (!aiTaskRequest) {
      return res.status(500).send('error')
    }

    const task = await enqueueAITaskJob({
      userId: uid,
      requestId: aiTaskRequest.id,
    })

    if (task) {
      return res.status(202).send({
        requestId: aiTaskRequest.id,
      })
    } else {
      // If job could not be enqueued fail the task
      await authTrx(
        async (t) => {
          return await t.getRepository(AITaskRequest).delete({
            id: aiTaskRequest.id,
          })
        },
        undefined,
        uid
      )
    }

    return res.status(500).end()
  })

  // Create an explain request, this will return an IDX to lookup the
  // result text
  router.get(
    '/:requestId',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const token = req?.cookies?.auth || req?.headers?.authorization
      const claims = await getClaimsByToken(token)
      if (!claims) {
        return res.status(401).send('UNAUTHORIZED')
      }
      const { uid } = claims
      const user = await userRepository.findById(uid)
      if (!user) {
        return res.status(400).send('Bad Request')
      }

      const requestId = req.params.requestId
      if (!requestId) {
        res.status(400).end()
        return
      }

      const result = await authTrx(
        async (t) => {
          return t.getRepository(AITaskResult).findOne({
            where: {
              request: { id: requestId },
              user: { id: uid },
            },
            relations: {
              request: {
                prompt: true,
              },
            },
          })
        },
        undefined,
        uid
      )
      if (result) {
        return res.status(200).send({
          text: result.resultText,
          prompt: result.request.prompt.displayText,
        })
      }

      // No result, so check if there is a valid request
      if (!result) {
        const existingTaskRequest = await authTrx(
          async (t) => {
            return await t.getRepository(AITaskRequest).findOne({
              where: {
                id: requestId,
                user: { id: uid },
              },
            })
          },
          undefined,
          uid
        )
        // TODO: validate that it has not timed out
        if (existingTaskRequest) {
          res.status(202).end()
          return
        }
      }

      res.status(500).end()
    }
  )

  return router
}
