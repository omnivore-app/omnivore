/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { CloudTasksClient, protos } from '@google-cloud/tasks'

type TaskPayload = {
  url: string
  userId: string
  saveRequestId: string
  source: string
}

const cloudTask = new CloudTasksClient()

export const createCloudTask = async (payload: TaskPayload) => {
  const queue = 'omnivore-import-queue'
  const location = process.env.GCP_LOCATION
  const project = process.env.GCP_PROJECT_ID
  const taskHandlerUrl = process.env.CONTENT_FETCH_GCF_URL

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
