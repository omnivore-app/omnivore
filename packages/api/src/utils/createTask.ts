/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
// Imports the Google Cloud Tasks library.
import { CloudTasksClient, protos } from '@google-cloud/tasks'
import axios from 'axios'
import { env } from '../env'
import { CreateTaskError } from './errors'
import { buildLogger } from './logger'
import { nanoid } from 'nanoid'
import { google } from '@google-cloud/tasks/build/protos/protos'
import { IntegrationType } from '../entity/integration'
import View = google.cloud.tasks.v2.Task.View

const logger = buildLogger('app.dispatch')

// Instantiates a client.
const client = new CloudTasksClient()

const createHttpTaskWithToken = async ({
  project,
  queue = env.queue.name,
  location = env.queue.location,
  taskHandlerUrl = env.queue.contentFetchUrl,
  serviceAccountEmail = `${process.env.GOOGLE_CLOUD_PROJECT}@appspot.gserviceaccount.com`,
  payload,
  priority = 'high',
  scheduleTime,
}: {
  project: string
  queue?: string
  location?: string
  taskHandlerUrl?: string
  serviceAccountEmail?: string
  payload: unknown
  priority?: 'low' | 'high'
  scheduleTime?: number
}): Promise<
  [
    protos.google.cloud.tasks.v2.ITask,
    protos.google.cloud.tasks.v2.ICreateTaskRequest | undefined,
    unknown | undefined
  ]
> => {
  // Construct the fully qualified queue name.
  if (priority === 'low') {
    queue = `${queue}-low`
    // use GCF url for low priority tasks
    taskHandlerUrl = env.queue.contentFetchGCFUrl
  }

  const parent = client.queuePath(project, location, queue)
  console.log(`Task creation options: `, {
    project,
    location,
    queue,
    taskHandlerUrl,
    serviceAccountEmail,
    payload,
  })

  // Convert message to buffer.
  let convertedPayload: string | ArrayBuffer
  try {
    convertedPayload = JSON.stringify(payload)
  } catch (error) {
    throw new CreateTaskError('Invalid payload')
  }
  const body = Buffer.from(convertedPayload).toString('base64')

  const task: protos.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: 'POST',
      url: taskHandlerUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      ...(serviceAccountEmail
        ? {
            oidcToken: {
              serviceAccountEmail,
            },
          }
        : null),
    },
    scheduleTime: scheduleTime
      ? protos.google.protobuf.Timestamp.fromObject({
          seconds: scheduleTime / 1000,
          nanos: (scheduleTime % 1000) * 1e6,
        })
      : null,
  }

  return client.createTask({ parent, task })
}

export const createAppEngineTask = async ({
  project,
  queue = env.queue.name,
  location = env.queue.location,
  taskHandlerUrl = env.queue.reminderTaskHanderUrl,
  payload,
  priority = 'high',
  scheduleTime,
}: {
  project: string
  queue?: string
  location?: string
  taskHandlerUrl?: string
  payload: unknown
  priority?: 'low' | 'high'
  scheduleTime?: number
}): Promise<string | undefined | null> => {
  // Construct the fully qualified queue name.
  if (priority === 'low') {
    queue = `${queue}-low`
  }

  const parent = client.queuePath(project, location, queue)
  console.log(`App Engine task creation options: `, {
    project,
    location,
    queue,
    taskHandlerUrl,
    payload,
  })

  const task: protos.google.cloud.tasks.v2.ITask = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: taskHandlerUrl,
    },
  }

  if (payload && task.appEngineHttpRequest) {
    // Convert message to buffer.
    let convertedPayload: string | ArrayBuffer
    try {
      convertedPayload = JSON.stringify(payload)
    } catch (error) {
      throw new CreateTaskError('Invalid payload')
    }

    task.appEngineHttpRequest.body =
      Buffer.from(convertedPayload).toString('base64')
  }

  if (scheduleTime) {
    // The time when the task is scheduled to be attempted.
    task.scheduleTime = {
      seconds: scheduleTime / 1000,
    }
  }

  console.log('Sending task:')
  console.log(task)
  // Send create task request.
  const request = { parent: parent, task: task }
  const [response] = await client.createTask(request)
  const name = response.name
  console.log(`Created task ${name}`)

  return name
}

export const getTask = async (
  taskName: string
): Promise<google.cloud.tasks.v2.ITask> => {
  // If we are in local environment
  if (env.dev.isLocal) {
    return { name: taskName } as protos.google.cloud.tasks.v2.ITask
  }

  const request: protos.google.cloud.tasks.v2.GetTaskRequest = {
    responseView: View.FULL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON(): { [p: string]: any } {
      return {}
    },
    name: taskName,
  }

  const [response] = await client.getTask(request)

  return response
}

export const deleteTask = async (
  taskName: string
): Promise<google.protobuf.IEmpty> => {
  // If we are in local environment
  if (env.dev.isLocal) {
    return taskName
  }

  const request: protos.google.cloud.tasks.v2.IDeleteTaskRequest = {
    name: taskName,
  }

  const [response] = await client.deleteTask(request)

  return response
}

/**
 * Enqueues the task for the article content parsing with Puppeteer by URL
 * @param url - URL address of the article to parse
 * @param userId - Id of the user authorized
 * @param saveRequestId - Id of the article_saving_request table record
 * @param priority - Priority of the task
 * @returns Name of the task created
 */
export const enqueueParseRequest = async (
  url: string,
  userId: string,
  saveRequestId: string,
  priority: 'low' | 'high' = 'high'
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    url,
    userId,
    saveRequestId,
  }

  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    // Calling the handler function directly.
    setTimeout(() => {
      axios.post(env.queue.contentFetchUrl, payload).catch((error) => {
        console.error(error)
        logger.warning(
          `Error occurred while requesting local puppeteer-parse function\nPlease, ensure your function is set up properly and running using "yarn start" from the "/pkg/gcf/puppeteer-parse" folder`
        )
      })
    }, 0)
    return ''
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    priority,
  })
  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueReminder = async (
  userId: string,
  scheduleTime: number
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT } = process.env
  const payload = {
    userId,
    scheduleTime,
  }

  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    return nanoid()
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    scheduleTime,
    taskHandlerUrl: env.queue.reminderTaskHanderUrl,
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export const enqueueSyncWithIntegration = async (
  userId: string,
  integrationType: IntegrationType
): Promise<string> => {
  const { GOOGLE_CLOUD_PROJECT, PUBSUB_VERIFICATION_TOKEN } = process.env
  // use pubsub data format to send the userId to the task handler
  const payload = {
    message: {
      data: Buffer.from(
        JSON.stringify({
          userId,
        })
      ).toString('base64'),
      publishTime: new Date().toISOString(),
    },
  }

  // If there is no Google Cloud Project Id exposed, it means that we are in local environment
  if (env.dev.isLocal || !GOOGLE_CLOUD_PROJECT) {
    return nanoid()
  }

  const createdTasks = await createHttpTaskWithToken({
    project: GOOGLE_CLOUD_PROJECT,
    payload,
    taskHandlerUrl: `${
      env.queue.integrationTaskHandlerUrl
    }/${integrationType.toLowerCase()}/sync_all?token=${PUBSUB_VERIFICATION_TOKEN}`,
    priority: 'low',
  })

  if (!createdTasks || !createdTasks[0].name) {
    logger.error(`Unable to get the name of the task`, {
      payload,
      createdTasks,
    })
    throw new CreateTaskError(`Unable to get the name of the task`)
  }
  return createdTasks[0].name
}

export default createHttpTaskWithToken
