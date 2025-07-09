/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cors from 'cors'
import express from 'express'
import {
  cacheShortcuts,
  getShortcuts,
  getShortcutsCache,
  resetShortcuts,
  setShortcuts,
} from '../services/user_personalization'
import { getClaimsByToken, getTokenByRequest } from '../utils/auth'
import { corsConfig } from '../utils/corsConfig'
import { logger } from '../utils/logger'

export function shortcutsRouter() {
  const router = express.Router()

  router.get(
    '/',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<any> => {
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
        const userId = claims?.uid ?? ''
        // const cachedShortcuts = await getShortcutsCache(userId)
        // if (cachedShortcuts) {
        //   return res.send({
        //     shortcuts: cachedShortcuts,
        //   })
        // }

        const shortcuts = await getShortcuts(userId)

        console.log('shortcuts-retrieved', shortcuts)
        const cache = await cacheShortcuts(userId, shortcuts)

        console.log('shortcuts cached', cache)

        return res.send({
          shortcuts,
        })
      } catch (e) {
        logger.info('error getting shortcuts', e)
        return res.status(500).send('UNKNOWN')
      }
    }
  )

  router.options('/', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.put(
    '/',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<any> => {
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
        const userId = claims?.uid ?? ''
        const shortcuts = await setShortcuts(userId, req.body.shortcuts)
        await cacheShortcuts(userId, shortcuts)

        return res.send({
          shortcuts,
        })
      } catch (e) {
        logger.info('error settings shortcuts', e)
        return res.status(500).send('UNKNOWN')
      }
    }
  )

  router.delete(
    '/',
    cors<express.Request>(corsConfig),
    async (req: express.Request, res: express.Response): Promise<any> => {
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
        const userId = claims?.uid ?? ''
        const success = await resetShortcuts(userId)
        if (success) {
          const shortcuts = await getShortcuts(userId)
          await cacheShortcuts(userId, shortcuts)

          return res.send({
            shortcuts,
          })
        }
        return res.status(500).send('FAILED_TO_RESET')
      } catch (e) {
        logger.info('error settings shortcuts', e)
        return res.status(500).send('UNKNOWN')
      }
    }
  )

  return router
}
