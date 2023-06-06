import * as Sentry from '@sentry/serverless'
import axios from 'axios'
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
}

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
              Article {
                id
                content
                image
              }
            }
            ... on ArticleError {
              errorCode
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
                previewImage
              }
            }
            ... on UpdateError{
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
  return 'slug' in body
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

// credit to https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/media.py#L706
const findThumbnail = async (content: string): Promise<string | null> => {
  const dom = parseHTML(content).document

  // find the largest and squarest image as the thumbnail
  // and pre-cache all images
  const images = dom.querySelectorAll('img[src]')
  if (!images || images.length === 0) {
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

    // ignore little images
    if (area < 5000) {
      console.debug('ignore little', src)
      continue
    }

    // ignore excessively long/wide images
    if (Math.max(...size) / Math.min(...size) > 1.5) {
      console.debug('ignore dimensions', src)
      continue
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
    const token = req.headers?.authorization
    if (!token) {
      return res.status(401).send('UNAUTHORIZED')
    }
    const { uid } = jwt.decode(token) as { uid: string }
    if (!uid) {
      return res.status(401).send('UNAUTHORIZED')
    }

    if (!isThumbnailRequest(req.body)) {
      return res.status(400).send('BAD_REQUEST')
    }

    const { slug } = req.body

    try {
      const page = await articleQuery(uid, slug)

      // find thumbnail from all images & pre-cache
      const thumbnail = await findThumbnail(page.content)
      if (!thumbnail) {
        return res.status(200).send('NOT_FOUND')
      }

      // update page with thumbnail if not already set
      if (page.image) {
        return res.status(200).send('OK')
      }

      await updatePageMutation(uid, page.id, thumbnail)

      res.send('ok')
    } catch (e) {
      console.error(e)
      return res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
