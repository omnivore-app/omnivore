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
import { getRepository } from 'typeorm'
import { appDataSource } from '../data_source'
import { authTrx } from '../repository'

export function aiSummariesRouter() {
  const router = express.Router()

  // // Get an indexed summary for an individual library item
  // router.get(
  //   '/library-item/:libraryItemId/:idx',
  //   cors<express.Request>(corsConfig),
  //   async (req, res) => {
  //     const token = req?.cookies?.auth || req?.headers?.authorization
  //     const claims = await getClaimsByToken(token)
  //     if (!claims) {
  //       return res.status(401).send('UNAUTHORIZED')
  //     }

  //     const { uid } = claims
  //     const user = await userRepository.findById(uid)
  //     if (!user) {
  //       return res.status(400).send('Bad Request')
  //     }

  //     const libraryItemId = req.params.libraryItemId
  //     console.log('params: ', req.params)
  //     if (!libraryItemId) {
  //       return res.status(400).send('Bad request - no library item id provided')
  //     }

  //     const idx = req.params.idx
  //     if (!idx) {
  //       return res.status(400).send('Bad request - no idx provided')
  //     }

  //     const result = await getAISummary({
  //       userId: user.id,
  //       idx: req.params.idx,
  //       libraryItemId: req.params.libraryItemId,
  //     })

  //     return res.send({
  //       summary: result?.summary,
  //     })
  //   }
  // )

  router.post('/', cors<express.Request>(corsConfig), async (req, res) => {
    // const token = req?.cookies?.auth || req?.headers?.authorization
    // const claims = await getClaimsByToken(token)
    // if (!claims) {
    //   return res.status(401).send('UNAUTHORIZED')
    // }
    // const { uid } = claims
    // const user = await userRepository.findById(uid)
    // if (!user) {
    //   return res.status(400).send('Bad Request')
    // }
    // const libraryItemId = req.params.libraryItemId
    // console.log('params: ', req.params)
    // if (!libraryItemId) {
    //   return res.status(400).send('Bad request - no library item id provided')
    // }
    // const idx = req.params.idx
    // if (!idx) {
    //   return res.status(400).send('Bad request - no idx provided')
    // }
    const uid = 'a03a7396-909b-11ed-9075-c3f3cf07eed9'
    const libraryItemId = '6d028a14-ef5d-11ee-87f4-b365da03b5e1'
    const promptName = 'explain-001'
    const extraText = ''

    const aiTaskResult = await authTrx(
      async (t) => {
        // Check to see if there is already a result
        return await t.getRepository(AITaskResult).findOne({
          where: {
            user: { id: uid },
            libraryItem: { id: libraryItemId },
            request: { promptName, extraText },
          },
          relations: ['request'],
        })
      },
      undefined,
      uid
    )

    if (aiTaskResult) {
      return res.status(201).send({
        jobId: aiTaskResult.request.id,
      })
    }

    // TODO: do a proper find or create, just easier to use typeorm for now
    const aiTaskRequest = await authTrx(
      async (t) => {
        const current = await t.getRepository(AITaskRequest).findOne({
          where: {
            user: { id: uid },
            libraryItem: { id: libraryItemId },
            prompt: { name: promptName },
            extraText,
          },
        })
        console.log('current aiTaskRequest: ', current)

        if (current) {
          return current
        }
        return await t.getRepository(AITaskRequest).save({
          libraryItem: { id: libraryItemId },
          user: { id: uid },
          prompt: { name: promptName },
          extraText,
        })
      },
      undefined,
      uid
    )
    console.log('aiTaskRequest: ', aiTaskRequest)

    // Check to see if there is already a request
    if (aiTaskRequest) {
      return res.status(201).send({
        jobId: aiTaskRequest.id,
      })
    }

    return res.status(400).send('error')
  })

  return router
}
