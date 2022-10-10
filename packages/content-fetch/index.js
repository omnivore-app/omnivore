/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const Sentry = require('@sentry/serverless');
const { fetchContent, preview } = require("@omnivore/puppeteer-parse");

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer, captures page content and sends it to backend
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.puppeteer = Sentry.GCPFunction.wrapHttpFunction(fetchContent);

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer and captures a screenshot of the provided element
 *
 * @param {Object} req Cloud Function request context.
 * Inlcudes:
 *  * url - URL address of the page to open
 * @param {Object} res Cloud Function response context.
 */
exports.preview = Sentry.GCPFunction.wrapHttpFunction(preview);
