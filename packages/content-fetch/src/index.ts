import { HttpFunction } from '@google-cloud/functions-framework'
import * as Sentry from '@sentry/serverless'
import 'dotenv/config'
import { contentFetchRequestHandler } from './request_handler'

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer, captures page content and sends it to backend
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
export const puppeteer = Sentry.GCPFunction.wrapHttpFunction(
  contentFetchRequestHandler as HttpFunction
)

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer and captures a screenshot of the provided element
 *
 * @param {Object} req Cloud Function request context.
 * Inlcudes:
 *  * url - URL address of the page to open
 * @param {Object} res Cloud Function response context.
 */
// exports.preview = Sentry.GCPFunction.wrapHttpFunction(preview);
