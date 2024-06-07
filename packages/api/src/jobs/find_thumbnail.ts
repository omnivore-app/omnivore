import axios, { AxiosResponse } from 'axios'
import sizeOf from 'image-size'
import { parseHTML } from 'linkedom'
import {
  findLibraryItemById,
  updateLibraryItem,
} from '../services/library_item'
import { createThumbnailProxyUrl } from '../utils/imageproxy'
import { logger } from '../utils/logger'

interface Data {
  libraryItemId: string
  userId: string
}

interface ImageSize {
  src: string
  width: number
  height: number
}

export const THUMBNAIL_JOB = 'find-thumbnail'

const fetchImage = async (url: string): Promise<AxiosResponse | null> => {
  logger.info('fetching image', { url })
  try {
    // get image file by url
    return await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10s
      maxContentLength: 20000000, // 20mb
    })
  } catch (e) {
    logger.error('fetch image error', e)
    return null
  }
}

export const getImageSize = async (src: string): Promise<ImageSize | null> => {
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
    logger.error('get image size error', e)
    return null
  }
}

export const fetchAllImageSizes = async (content: string) => {
  const dom = parseHTML(content).document

  // fetch all images by src and get their sizes
  const images = dom.querySelectorAll('img[src]')
  if (!images || images.length === 0) {
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
export const _findThumbnail = (imagesSizes: (ImageSize | null)[]) => {
  // find the largest and squarest image as the thumbnail
  let thumbnail = ''
  let largestArea = 0
  for (const imageSize of Array.from(imagesSizes)) {
    if (!imageSize) {
      continue
    }

    let area = imageSize.width * imageSize.height

    // ignore small images
    if (area < 5000) {
      continue
    }

    // penalize excessively long/wide images
    const ratio =
      Math.max(imageSize.width, imageSize.height) /
      Math.min(imageSize.width, imageSize.height)
    if (ratio > 1.5) {
      area /= ratio * 2
    }

    // penalize images with "sprite" in their name
    if (imageSize.src.toLowerCase().includes('sprite')) {
      area /= 10
    }

    if (area > largestArea) {
      largestArea = area
      thumbnail = imageSize.src
    }
  }

  return thumbnail
}

export const findThumbnail = async (data: Data) => {
  const { libraryItemId, userId } = data

  const item = await findLibraryItemById(libraryItemId, userId, {
    select: ['thumbnail', 'readableContent'],
  })
  if (!item) {
    logger.info('page not found')
    return false
  }

  const thumbnail = item.thumbnail
  if (thumbnail) {
    const proxyUrl = createThumbnailProxyUrl(thumbnail)
    // pre-cache thumbnail first if exists
    const image = await fetchImage(proxyUrl)
    if (!image) {
      logger.info('thumbnail image not found')
      item.thumbnail = undefined
    }
  }

  logger.info('pre-caching all images...')
  // pre-cache all images in the content and get their sizes
  const imageSizes = await fetchAllImageSizes(item.readableContent)
  // find thumbnail from all images if thumbnail not set
  if (!item.thumbnail && imageSizes.length > 0) {
    const thumbnail = _findThumbnail(imageSizes)
    if (!thumbnail) {
      logger.info('no thumbnail found from content')
      return false
    }

    // update page with thumbnail
    await updateLibraryItem(
      libraryItemId,
      {
        thumbnail,
      },
      userId,
      undefined,
      true
    )
    logger.info(`thumbnail updated: ${thumbnail}`)
  }

  return true
}
