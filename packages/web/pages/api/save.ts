import type { NextApiRequest, NextApiResponse } from 'next'
import { saveUrlMutation } from '../../lib/networking/mutations/saveUrlMutation'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const urlStr = req.query['url']
  const url = new URL(urlStr as string)
  const saveResult = await saveUrlMutation(url.toString())
  if (saveResult?.jobId) {
    res.redirect(`/sr/${saveResult?.jobId}`)
    return
  }

  res.status(200).send('ok')
}
