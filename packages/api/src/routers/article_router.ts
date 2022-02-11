/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import express from 'express'
import axios from 'axios'
import {
  CreateArticleErrorCode,
  CreateArticleSavingRequestResult,
} from './../generated/graphql'
import { isSiteBlockedForParse } from './../utils/blocked'
import cors from 'cors'
import { env } from './../env'
import { buildLogger } from './../utils/logger'
import * as jwt from 'jsonwebtoken'
import { promisify } from 'util'
import { corsConfig } from '../utils/corsConfig'
import { v4 as uuidv4 } from 'uuid'
import { createPageSaveRequest } from '../services/create_page_save_request'
import { initModels } from '../server'
import { kx } from '../datalayer/knex_config'

const logger = buildLogger('app.dispatch')
const signToken = promisify(jwt.sign)

export function articleRouter() {
  const router = express.Router()

  router.options('/save', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post('/save', cors<express.Request>(corsConfig), async (req, res) => {
    const { url, v } = req.body as {
      url?: string
      v?: string
    }

    const token = req?.cookies?.auth || req?.headers?.authorization
    if (!token || !jwt.verify(token, env.server.jwtSecret)) {
      return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
    }

    const { uid } = (jwt.decode(token) || {}) as { uid: string }

    logger.info('Article saving request', {
      body: req.body,
      labels: {
        source: 'SaveEndpoint',
        userId: uid,
      },
    })

    if (!url) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const requestId = uuidv4()
    const models = initModels(kx, false)
    const result = await createPageSaveRequest(
      uid,
      url,
      models,
      'high',
      requestId
    )

    if (isSiteBlockedForParse(url)) {
      return res
        .status(400)
        .send({ errorCode: CreateArticleErrorCode.NotAllowedToParse })
    }

    if (result.errorCode) {
      return res.status(400).send({ errorCode: result.errorCode })
    }

    return res.send({
      articleSavingRequestId: requestId,
    })
  })
  return router
}
