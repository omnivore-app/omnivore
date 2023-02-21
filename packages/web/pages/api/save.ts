import type { NextApiRequest, NextApiResponse } from 'next'
import {
  SaveResponseData,
  saveUrlMutation,
} from '../../lib/networking/mutations/saveUrlMutation'
import { ssrFetcher } from '../../lib/networking/networkHelpers'
import { v4 as uuidv4 } from 'uuid'

const saveUrl = async (req: NextApiRequest, url: URL) => {
  const clientRequestId = uuidv4()
  const mutation = `
    mutation SaveUrl($input: SaveUrlInput!) {
      saveUrl(input: $input) {
        ... on SaveSuccess {
          url
          clientRequestId
        }
        ... on SaveError {
          errorCodes
          message
        }
      }
    }
  `

  try {
    const data = await ssrFetcher({ req }, mutation, {
      input: {
        clientRequestId,
        url: url.toString(),
        source: 'api-save-url',
      },
    })

    const output = data as SaveResponseData | undefined
    return {
      url: output?.saveUrl?.url,
      jobId: output?.saveUrl?.clientRequestId,
      clientRequestId: output?.saveUrl?.clientRequestId,
    }
  } catch (error) {
    console.log('error savingUrl', { error })
    return undefined
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const urlStr = req.query['url']
  const url = new URL(urlStr as string)
  const saveResult = await saveUrl(req, url)
  console.log('saveResult: ', saveResult)
  if (saveResult?.jobId) {
    res.redirect(`/sr/${saveResult?.jobId}`)
    return
  }

  res.status(200).send('ok')
}
