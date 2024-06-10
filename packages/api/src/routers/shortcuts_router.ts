/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cors from 'cors'
import express from 'express'
import { env } from '../env'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'
import {
  getShortcuts,
  resetShortcuts,
  setShortcuts,
} from '../services/user_personalization'

export function shortcutsRouter() {
  const router = express.Router()

  router.get('/', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('get shortcuts router')
    const token = getTokenByRequest(req)

    let claims
    try {
      claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('failed to authorize')
        return res.status(401).send('UNAUTHORIZED')
      }
    } catch (e) {
      logger.info('failed to authorize', e)
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      const shortcuts = await getShortcuts(claims.uid)
      return res.send({
        shortcuts: shortcuts ?? [],
      })
    } catch (e) {
      logger.info('error getting shortcuts', e)
    }

    return res.status(500).send('UNKNOWN')
  })

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.put('/', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('put shortcuts router')
    const token = getTokenByRequest(req)

    let claims
    try {
      claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('failed to authorize')
        return res.status(401).send('UNAUTHORIZED')
      }
    } catch (e) {
      logger.info('failed to authorize', e)
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      const shortcuts = await setShortcuts(claims.uid, req.body.shortcuts)
      return res.send({
        shortcuts: shortcuts ?? [],
      })
    } catch (e) {
      logger.info('error settings shortcuts', e)
    }

    return res.status(500).send('UNKNOWN')
  })

  router.delete('/', cors<express.Request>(corsConfig), async (req, res) => {
    logger.info('delete shortcuts router')
    const token = getTokenByRequest(req)

    let claims
    try {
      claims = await getClaimsByToken(token)
      if (!claims) {
        logger.info('failed to authorize')
        return res.status(401).send('UNAUTHORIZED')
      }
    } catch (e) {
      logger.info('failed to authorize', e)
      return res.status(401).send('UNAUTHORIZED')
    }

    try {
      const success = await resetShortcuts(claims.uid)
      if (success) {
        const shortcuts = await getShortcuts(claims.uid)
        return res.send({
          shortcuts: shortcuts ?? [],
        })
      }
    } catch (e) {
      logger.info('error settings shortcuts', e)
    }

    return res.status(500).send('UNKNOWN')
  })

  return router
}
