import * as Sentry from '@sentry/serverless'
import axios, { AxiosResponse } from 'axios'
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
}

interface ImageSize {
  src: string
  width: number
  height: number
}

dotenv.config()
Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
})

const signToken = promisify(jwt.sign)
const REQUEST_TIMEOUT = 30000 // 30s

const articleQuery = async (
  userId: string,
  slug: string
): Promise<Page | null> => {
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

  try {
    const response = await axios.post<ArticleResponse>(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth};`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )

    return response.data.data.article.article
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('article query error', error.message)
    } else {
      console.error(error)
    }
    return null
  }
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
  try {
    const response = await axios.post<UpdatePageResponse>(
      `${REST_BACKEND_ENDPOINT}/graphql`,
      data,
      {
        headers: {
          Cookie: `auth=${auth};`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      }
    )

    return !!response.data.data.updatePage
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('update page mutation error', error.message)
    } else {
      console.error(error)
    }
    return false
  }
}

const isThumbnailRequest = (body: any): body is ThumbnailRequest => {
  return 'slug' in body
}

const fetchImage = async (url: string): Promise<AxiosResponse | null> => {
  console.log('fetching image', url)
  try {
    // get image file by url
    return await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10s
      maxContentLength: 20000000, // 20mb
    })
  } catch (e) {
    console.log('fetch image error', e)
    return null
  }
}

const getImageSize = async (src: string): Promise<ImageSize | null> => {
  try {
    const response = await fetchImage(src)
    if (!response) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const buffer = Buffer.from(response.data, 'binary')

    // get image size
    const { width, height } = sizeOf(buffer)

    if (!width || !height) {
      return null
    }

    return {
      src,
      width,
      height,
    }
  } catch (e) {
    console.log(e)
    return null
  }
}

export const fetchAllImageSizes = async (content: string) => {
  const dom = parseHTML(content).document

  // fetch all images by src and get their sizes
  const images = dom.querySelectorAll('img[src]')
  if (!images || images.length === 0) {
    console.log('no images')
    return []
  }

  return Promise.all(
    Array.from(images).map((image) => {
      const src = image.getAttribute('src')
      if (!src) {
        return null
      }

      return getImageSize(src)
    })
  )
}

// credit: https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/media.py#L706
export const findThumbnail = (imagesSizes: (ImageSize | null)[]) => {
  // find the largest and squarest image as the thumbnail
  let thumbnail = null
  let largestArea = 0
  for (const imageSize of Array.from(imagesSizes)) {
    if (!imageSize) {
      continue
    }

    let area = imageSize.width * imageSize.height

    // ignore small images
    if (area < 5000) {
      console.log('ignore small', imageSize.src)
      continue
    }

    // penalize excessively long/wide images
    const ratio =
      Math.max(imageSize.width, imageSize.height) /
      Math.min(imageSize.width, imageSize.height)
    if (ratio > 1.5) {
      console.log('penalizing long/wide', imageSize.src)
      area /= ratio * 2
    }

    // penalize images with "sprite" in their name
    if (imageSize.src.toLowerCase().includes('sprite')) {
      console.log('penalizing sprite', imageSize.src)
      area /= 10
    }

    if (area > largestArea) {
      largestArea = area
      thumbnail = imageSize.src
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

    const token = req.headers.cookie?.split('auth=')[1]
    if (!token) {
      return res.status(401).send('UNAUTHORIZED')
    }
    let uid = ''
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        uid: string
      }
      uid = decoded.uid
    } catch (e) {
      return res.status(401).send('UNAUTHORIZED')
    }

    if (!isThumbnailRequest(req.body)) {
      return res.status(400).send('BAD_REQUEST')
    }

    const { slug } = req.body

    try {
      const page = await articleQuery(uid, slug)
      if (!page) {
        console.info('page not found')
        return res.status(200).send('NOT_FOUND')
      }

      if (page.image) {
        console.log('thumbnail already set')
        // pre-cache thumbnail first if exists
        const image = await fetchImage(page.image)
        if (!image) {
          console.log('thumbnail image not found')
          page.image = undefined
        }
      }

      console.log('pre-caching all images...')
      // pre-cache all images in the content and get their sizes
      const imageSizes = await fetchAllImageSizes(page.content)
      // find thumbnail from all images if thumbnail not set
      if (!page.image && imageSizes.length > 0) {
        console.log('finding thumbnail...')
        const thumbnail = findThumbnail(imageSizes)
        if (!thumbnail) {
          console.log('no thumbnail found from content')
          return res.status(200).send('NOT_FOUND')
        }

        // update page with thumbnail
        const updated = await updatePageMutation(uid, page.id, thumbnail)
        console.log('thumbnail updated', updated)
      }

      res.send('ok')
    } catch (e) {
      console.error(e)
      res.status(500).send('INTERNAL_SERVER_ERROR')
    }
  }
)
