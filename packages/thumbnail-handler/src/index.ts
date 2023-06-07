import * as Sentry from '@sentry/serverless'
import axios from 'axios'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import sizeOf from 'image-size'
import * as jwt from 'jsonwebtoken'
import { parseHTML } from 'linkedom'
import { promisify } from 'util'

interface ArticleResponse {
  data: {
    article: {
      article: Page
    }
  }
}

interface Page {
  id: string
  content: string
  image?: string
}

interface UpdatePageResponse {
  data: {
    updatePage: {
      updatedPage: Page
    }
  }
}

interface ThumbnailRequest {
  slug: string
  content: string
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)

const articleQuery = async (userId: string, slug: string): Promise<Page> => {
  const JWT_SECRET = process.env.JWT_SECRET
  const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

  if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
    throw 'Environment not configured correctly'
  }

  const data = JSON.stringify({
    query: `query article ($username: String!, $slug: String!){
          article(username: $username, slug: $slug){
            ... on ArticleSuccess {
              article {
                id
                content
                image
              }
            }
            ... on ArticleError {
              errorCodes
            }
          }
    }`,
    variables: {
      username: 'me',
      slug,
    },
  })
  const auth = (await signToken({ uid: userId }, JWT_SECRET)) as string

  const response = await axios.post<ArticleResponse>(
    `${REST_BACKEND_ENDPOINT}/graphql`,
    data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data.data.article.article
}

const updatePageMutation = async (
  userId: string,
  pageId: string,
  image: string
) => {
  const JWT_SECRET = process.env.JWT_SECRET
  const REST_BACKEND_ENDPOINT = process.env.REST_BACKEND_ENDPOINT

  if (!JWT_SECRET || !REST_BACKEND_ENDPOINT) {
    throw 'Environment not configured correctly'
  }

  const data = JSON.stringify({
    query: `mutation UpdatePage ($input: UpdatePageInput!) {
          updatePage(input: $input) {
            ... on UpdatePageSuccess {
              updatedPage {
                id
              }
            }
            ... on UpdatePageError {
              errorCodes
            }
          }
    }`,
    variables: {
      input: {
        pageId,
        previewImage: image,
      },
    },
  })

  const auth = (await signToken({ uid: userId }, JWT_SECRET)) as string
  const response = await axios.post<UpdatePageResponse>(
    `${REST_BACKEND_ENDPOINT}/graphql`,
    data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    }
  )

  return !!response.data.data.updatePage
}

const isThumbnailRequest = (body: any): body is ThumbnailRequest => {
  return 'slug' in body && 'content' in body
}

const getImageSize = async (url: string): Promise<[number, number] | null> => {
  try {
    // get image file by url
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const buffer = Buffer.from(response.data, 'binary')

    // get image size
    const { width, height } = sizeOf(buffer)

    if (!width || !height) {
      return null
    }

    return [width, height]
  } catch (e) {
    console.log(e)
    return null
  }
}

// credit: https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/media.py#L706
export const findThumbnail = async (
  content: string
): Promise<string | null> => {
  const dom = parseHTML(content).document

  // find the largest and squarest image as the thumbnail
  // and pre-cache all images
  const images = dom.querySelectorAll('img[src]')
  if (!images || images.length === 0) {
    console.debug('no images')
    return null
  }

  let thumbnail = null
  let largestArea = 0
  for await (const image of Array.from(images)) {
    const src = image.getAttribute('src')
    if (!src) {
      continue
    }

    const size = await getImageSize(src)
    if (!size) {
      continue
    }

    let area = size[0] * size[1]

    // ignore small images
    if (area < 5000) {
      console.debug('ignore small', src)
      continue
    }

    // penalize excessively long/wide images
    const ratio = Math.max(...size) / Math.min(...size)
    if (ratio > 1.5) {
      console.debug('penalizing long/wide', src)
      area /= ratio * 2
    }

    // penalize images with "sprite" in their name
    if (src.toLowerCase().includes('sprite')) {
      console.debug('penalizing sprite', src)
      area /= 10
    }

    if (area > largestArea) {
      largestArea = area
      thumbnail = src
    }
  }

  return thumbnail
}

/**
 * request structure
 * {
 *   userId: string
 *   slug: string
 * }
 */

export const thumbnailHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not exists')
      return res.status(500).send('JWT_SECRET_NOT_EXISTS')
    }

    const token = req.headers?.authorization
    console.debug('token', token)
    if (!token) {
      console.debug('no token')
      return res.status(401).send('UNAUTHORIZED')
    }
    let uid = ''
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        uid: string
      }
      uid = decoded.uid
    } catch (e) {
      console.debug(e)
      return res.status(401).send('UNAUTHORIZED')
    }

    if (!isThumbnailRequest(req.body)) {
      console.debug('bad request')
      return res.status(400).send('BAD_REQUEST')
    }

    const { slug, content } = req.body

    try {
      // find thumbnail from all images & pre-cache
      const thumbnail = await findThumbnail(content)
      if (!thumbnail) {
        console.debug('no thumbnail')
        return res.status(200).send('NOT_FOUND')
      }

      const page = await articleQuery(uid, slug)
      console.debug('find page', page.id)
      // update page with thumbnail if not already set
      if (page.image) {
        console.debug('thumbnail already set')
        return res.status(200).send('OK')
      }

      const updated = await updatePageMutation(uid, page.id, thumbnail)
      console.debug('thumbnail updated', updated)

      res.send('ok')
    } catch (e) {
      console.error(e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
