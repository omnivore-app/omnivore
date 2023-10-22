import { MetricServiceClient } from '@google-cloud/monitoring'
import { v2beta3 } from '@google-cloud/tasks'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

import * as Sentry from '@sentry/serverless'

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const PROJECT_ID = process.env.GCP_PROJECT_ID
const LOCATION = 'us-west2'
const IMPORT_QUEUE_NAME = process.env.IMPORT_QUEUE_NAME
const RSS_QUEUE_NAME = process.env.RSS_FEED_QUEUE_NAME
const QUEUE_NAMES = [IMPORT_QUEUE_NAME, RSS_QUEUE_NAME]
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const METRICS_FILTER = `metric.type="appengine.googleapis.com/http/server/response_latencies" metric.labels.response_code="200"`

if (
  !PROJECT_ID ||
  !IMPORT_QUEUE_NAME ||
  !RSS_QUEUE_NAME ||
  !DISCORD_WEBHOOK_URL
) {
  throw new Error('environment not supplied.')
}

const LATENCY_THRESHOLD = 500
const RSS_QUEUE_THRESHOLD = 20_000
const IMPORT_QUEUE_THRESHOLD = 250_000

const postToDiscord = async (message: string) => {
  console.log('notify message', { message })
  const payload = {
    content: message,
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Discord response was not ok: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to post message to Discord:', error)
  }
}

const checkShouldPauseQueues = async () => {
  const now = Date.now()
  const client = new MetricServiceClient()

  // Query for the metrics from the last 5 minutes
  const [timeSeries] = await client.listTimeSeries({
    name: client.projectPath(PROJECT_ID),
    filter: METRICS_FILTER,
    interval: {
      startTime: {
        seconds: Math.floor(now / 1000 - 5 * 60),
      },
      endTime: {
        seconds: Math.floor(now / 1000),
      },
    },
    aggregation: {
      alignmentPeriod: {
        seconds: 300,
      },
      perSeriesAligner: 'ALIGN_PERCENTILE_95',
    },
  })

  for (const ts of timeSeries) {
    // We only want to look at the backend service right now
    if (
      !ts.resource ||
      !ts.resource.labels ||
      !ts.resource.labels['module_id'] ||
      !ts.resource.labels['module_id'].startsWith('backend')
    ) {
      continue
    }

    if (ts.points && ts.points.length) {
      const avgLatency =
        ts.points.reduce(
          (acc, point) => acc + (point.value?.doubleValue ?? 0),
          0
        ) / ts.points.length
      if (avgLatency > LATENCY_THRESHOLD) {
        return { shouldPauseQueues: true, avgLatency: avgLatency }
      }
    }
  }

  return { shouldPauseQueues: false, avgLatency: 0 }
}

const getQueueTaskCount = async (queueName: string) => {
  const cloudTasksClient = new v2beta3.CloudTasksClient()
  const queuePath = cloudTasksClient.queuePath(PROJECT_ID, LOCATION, queueName)
  const [queue] = await cloudTasksClient.getQueue({
    name: queuePath,
    readMask: { paths: ['name', 'stats'] },
  })

  console.log(' queue.stats', { stats: queue.stats })
  if (Number.isNaN(queue.stats?.tasksCount)) {
    return 0
  }
  return Number(queue.stats?.tasksCount)
}

const pauseQueues = async () => {
  const cloudTasksClient = new v2beta3.CloudTasksClient()

  await Promise.all([
    cloudTasksClient.pauseQueue({
      name: cloudTasksClient.queuePath(PROJECT_ID, LOCATION, RSS_QUEUE_NAME),
    }),
    cloudTasksClient.pauseQueue({
      name: cloudTasksClient.queuePath(PROJECT_ID, LOCATION, IMPORT_QUEUE_NAME),
    }),
  ])
}

async function checkMetricsAndPauseQueues() {
  if (
    !PROJECT_ID ||
    !IMPORT_QUEUE_NAME ||
    !RSS_QUEUE_NAME ||
    !DISCORD_WEBHOOK_URL
  ) {
    throw new Error('environment not supplied.')
  }

  const { shouldPauseQueues, avgLatency } = await checkShouldPauseQueues()

  if (shouldPauseQueues) {
    let rssQueueCount: number | string = 'unknown'
    let importQueueCount: number | string = 'unknown'
    try {
      rssQueueCount = await getQueueTaskCount(RSS_QUEUE_NAME)
      importQueueCount = await getQueueTaskCount(IMPORT_QUEUE_NAME)
    } catch (err) {
      console.log('error fetching queue counts', err)
    }

    const message = `Both queues have been paused due to API latency threshold exceedance (${avgLatency}).\n\t-The RSS queue currently has ${rssQueueCount} tasks.\n\t-The import queue currently has ${importQueueCount} pending tasks.`

    await pauseQueues()
    await postToDiscord(message)
  } else {
    try {
      const rssQueueCount = await getQueueTaskCount(RSS_QUEUE_NAME)
      const importQueueCount = await getQueueTaskCount(IMPORT_QUEUE_NAME)

      if (rssQueueCount > RSS_QUEUE_THRESHOLD) {
        await postToDiscord(
          `The RSS queue has exceeded it's threshold, it has ${rssQueueCount} items in it.`
        )
      }

      if (importQueueCount > IMPORT_QUEUE_THRESHOLD) {
        await postToDiscord(
          `The import queue has exceeded it's threshold, it has ${importQueueCount} items in it.`
        )
      }
    } catch (err) {
      console.log('error getting queue counts')
    }
  }
}

export const queueManager = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    try {
      if (req.query['check']) {
        await checkMetricsAndPauseQueues()
      }
      res.send('ok')
    } catch (e) {
      console.error('Error while parsing RSS feed', e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
