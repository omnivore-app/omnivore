import axios from 'axios'
import _ from 'underscore'
import { ContentHandler, PreHandleResult } from '../content-handler'

const YOUTUBE_URL_MATCH =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/|shorts\/|playlist\?list=)?)([\w-]+)(\S+)?$/

export const getYoutubeVideoId = (url: string) => {
  const u = new URL(url)
  return u.searchParams.get('v')
}

export const getYoutubePlaylistId = (url: string) => {
  const u = new URL(url)
  return u.searchParams.get('list')
}

export const getEmbedData = (url: string) => {
  const BaseUrl = 'https://www.youtube.com'
  const embedBaseUrl = 'https://www.youtube.com/embed'

  const match = url.match(YOUTUBE_URL_MATCH)
  if (match === null || match.length < 6) {
    console.error('Invalid youtube url', url)
    throw new Error(`Invalid youtube url: ${url}`)
  }

  const playlistId = getYoutubePlaylistId(url)
  if (playlistId) {
    return {
      src: `${embedBaseUrl}/videoseries?list=${playlistId}`,
      url: `${BaseUrl}/playlist?list=${playlistId}`,
    }
  }

  const type = match[4]
  const id = match[5]
  if (type === '/shorts/') {
    return {
      src: `${embedBaseUrl}/${id}`,
      url: `${BaseUrl}/shorts/${id}`,
    }
  }

  const videoId = getYoutubeVideoId(url) || id
  return {
    src: `${embedBaseUrl}/${videoId}`,
    url: `${BaseUrl}/watch?v=${videoId}`,
  }
}

export const escapeTitle = (title: string) => {
  return _.escape(title)
}

export class YoutubeHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Youtube'
  }

  shouldPreHandle(url: string): boolean {
    return YOUTUBE_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    let src, urlToEncode

    try {
      const embedData = getEmbedData(url)
      src = embedData.src
      urlToEncode = embedData.url
    } catch (error) {
      console.error('Error getting embed data', error)
      return {}
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
    }
    // escape html entities in title
    const title = oembed.title
    const escapedTitle = escapeTitle(title)
    const ratio = oembed.width / oembed.height
    const thumbnail = oembed.thumbnail_url
    const height = 350
    const width = height * ratio
    const authorName = _.escape(oembed.author_name)
    const content = `
    <html>
      <head><title>${escapedTitle}</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${escapedTitle}" />
      <meta property="og:description" content="${escapedTitle}" />
      <meta property="og:article:author" content="${authorName}" />
      <meta property="og:site_name" content="YouTube" />
      <meta property="og:type" content="video" />
      </head>
      <body>
      <div>
        <article id="_omnivore_youtube">
          <iframe id="_omnivore_youtube_video" width="${width}" height="${height}" src="${src}" title="${escapedTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          <p><a href="${url}" target="_blank">${escapedTitle}</a></p>
          <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${authorName}</a></p>
          <div id="_omnivore_youtube_transcript"></div>
        </article>
      </div>
      </body>
    </html>`

    return { content, title }
  }
}
