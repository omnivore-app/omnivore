import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import _ from 'underscore'

const YOUTUBE_URL_MATCH =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

export const getYoutubeVideoId = (url: string) => {
  const u = new URL(url)
  const videoId = u.searchParams.get('v')
  if (!videoId) {
    const match = url.toString().match(YOUTUBE_URL_MATCH)
    if (match === null || match.length < 6 || !match[5]) {
      return undefined
    }
    return match[5]
  }
  return videoId
}

export const getYoutubePlaylistId = (url: string) => {
  const u = new URL(url)
  return u.searchParams.get('list')
}

export const escapeTitle = (title: string) => {
  return _.escape(title)
}

export class YoutubeHandler extends ContentHandler {
  static apiKey = process.env.YOUTUBE_API_KEY
  constructor() {
    super()
    this.name = 'Youtube'
  }

  shouldPreHandle(url: string): boolean {
    return YOUTUBE_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const BaseUrl = 'https://www.youtube.com'
    const embedBaseUrl = 'https://www.youtube.com/embed'
    const dataApiBaseUrl = 'https://www.googleapis.com/youtube/v3'
    let urlToEncode: string
    let src: string
    let dataUrl: string
    const playlistId = getYoutubePlaylistId(url)
    if (playlistId) {
      urlToEncode = `${BaseUrl}/playlist?list=${playlistId}`
      src = `${embedBaseUrl}/videoseries?list=${playlistId}`
      dataUrl = `${dataApiBaseUrl}/playlists?part=snippet&id=${playlistId}`
    } else {
      const videoId = getYoutubeVideoId(url)
      if (!videoId) {
        return {}
      }
      urlToEncode = `${BaseUrl}/watch?v=${videoId}`
      src = `${embedBaseUrl}/embed/${videoId}`
      dataUrl = `${dataApiBaseUrl}/videos?part=snippet&id=${videoId}`
    }

    const oembedUrl =
      `https://www.youtube.com/oembed?format=json&url=` +
      encodeURIComponent(urlToEncode)
    const oembed = (await axios.get(oembedUrl.toString())).data as {
      title: string
      width: number
      height: number
      thumbnail_url: string
      author_name: string
      author_url: string
      provider_name: string
    }
    // escape html entities in title
    const title = oembed.title
    const escapedTitle = escapeTitle(title)
    const ratio = oembed.width / oembed.height
    const thumbnail = oembed.thumbnail_url
    const height = 350
    const width = height * ratio
    const authorName = _.escape(oembed.author_name)
    let publishedAt = ''
    if (YoutubeHandler.apiKey) {
      // Make a GET request to the YouTube Data API and parse the response
      try {
        const response = (
          await axios.get(`${dataUrl}&key=${YoutubeHandler.apiKey}`)
        ).data as {
          items: {
            snippet: {
              publishedAt: string
            }
          }[]
        }
        if (response.items.length > 0) {
          publishedAt = response.items[0].snippet.publishedAt
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            'Error getting video/playlist publishedAt',
            error.response?.data
          )
        } else {
          console.error('Error getting video/playlist publishedAt', error)
        }
      }
    }
    const content = `
    <html>
      <head><title>${escapedTitle}</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${escapedTitle}" />
      <meta property="og:description" content="" />
      <meta property="og:article:author" content="${authorName}" />
      <meta property="og:article:published_time" content="${publishedAt}" />
      <meta property="og:site_name" content="${oembed.provider_name}" />
      </head>
      <body>
      <iframe width="${width}" height="${height}" src="${src}" title="${escapedTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p><a href="${url}" target="_blank">${escapedTitle}</a></p>
        <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${authorName}</a></p>
      </body>
    </html>`

    return { content, title }
  }
}
