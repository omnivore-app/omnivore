import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { locale, timeZone } from '../../lib/dateFormatting'
import { SaveResponseData } from '../../lib/networking/mutations/saveUrlMutation'
import { ssrFetcher } from '../../lib/networking/networkHelpers'

type Request = NextApiRequest & { cookies: { [key: string]: string } }
type Response = NextApiResponse

const saveUrl = async (
  req: Request,
  url: URL,
  labels: string[] | undefined,
  state: string | undefined,
  timezone?: string,
  locale?: string
) => {
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
        labels: labels?.map((label) => ({ name: label })),
        state,
        timezone,
        locale,
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

export default async function handler(req: Request, res: Response) {
  const urlStr = req.query['url']
  if (req.query['labels'] && typeof req.query['labels'] === 'string') {
    req.query['labels'] = [req.query['labels']]
  }
  const labels = req.query['labels'] as string[] | undefined
  const state = req.query['state'] as string | undefined
  const url = new URL(urlStr as string)
  const saveResult = await saveUrl(req, url, labels, state, timeZone, locale)
  console.log('saveResult: ', saveResult)
  if (saveResult) {
    res.redirect(`/article?url=${encodeURIComponent(url.toString())}`)
    return
  }

  res.status(200).send('ok')
}
