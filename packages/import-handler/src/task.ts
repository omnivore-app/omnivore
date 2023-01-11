/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CloudTasksClient, protos } from '@google-cloud/tasks'

const cloudTask = new CloudTasksClient()

export const emailUserUrl = () => {
  const envar = process.env.INTERNAL_SVC_ENDPOINT
  if (envar) {
    return envar + 'api/user/email'
  }
  throw 'INTERNAL_SVC_ENDPOINT not set'
}

export const CONTENT_FETCH_URL = process.env.CONTENT_FETCH_GCF_URL

export const createCloudTask = async (
  taskHandlerUrl: string | undefined,
  payload: unknown,
  requestHeaders?: Record<string, string>
) => {
  const queue = 'omnivore-import-queue'
  const location = process.env.GCP_LOCATION
  const project = process.env.GCP_PROJECT_ID

  if (!project || !location || !queue || !taskHandlerUrl) {
    throw `Environment not configured: ${project}, ${location}, ${queue}, ${taskHandlerUrl}`
  }

  const serviceAccountEmail = `${project}@appspot.gserviceaccount.com`

  const parent = cloudTask.queuePath(project, location, queue)
  console.log(`Task creation options: `, {
    project,
    location,
    queue,
    taskHandlerUrl,
    serviceAccountEmail,
    payload,
  })

  const convertedPayload = JSON.stringify(payload)
  const body = Buffer.from(convertedPayload).toString('base64')
  const task: protos.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: 'POST',
      url: taskHandlerUrl,
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
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
  }

  return cloudTask.createTask({ parent, task }).then((result) => {
    return result[0].name ?? undefined
  })
}
