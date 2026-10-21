import axios from 'axios'
import _ from 'underscore'
import { ContentHandler, PreHandleResult } from '../content-handler'

export class PipedVideoHandler extends ContentHandler {
  // https://piped.video/watch?v={videoId}
  PIPED_URL_MATCH = /^((?:https?:)?\/\/)?piped\.video\/watch\?v=[^&]+/

  constructor() {
    super()
    this.name = 'Piped-video'
  }

  getYoutubeVideoId = (url: string) => {
    const u = new URL(url)
    return u.searchParams.get('v')
  }

  escapeTitle = (title: string) => {
    return _.escape(title)
  }

  shouldPreHandle(url: string): boolean {
    return this.PIPED_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const videoId = this.getYoutubeVideoId(url)
    if (!videoId) {
      return {}
    }
    const baseUrl = 'https://api-piped.mha.fi'
    const apiUrl = `${baseUrl}/streams/${videoId}`
    const metadata = (await axios.get(apiUrl)).data as {
      title: string
      thumbnailUrl: string
      uploader: string
      uploaderUrl: string
      uploadDate: string
      description: string
      videoStreams: {
        width: number
        height: number
        url: string
      }[]
    }
    const videoStreams = metadata.videoStreams
    if (!videoStreams || videoStreams.length == 0) {
      return {}
    }
    const videoStream = videoStreams[0]
    const src = `https://piped.mha.fi/embed/${videoId}`
    // escape html entities in title
    const title = metadata.title
    const escapedTitle = this.escapeTitle(title)
    const ratio = videoStream.width / videoStream.height
    const thumbnail = metadata.thumbnailUrl
    const height = 350
    const width = height * ratio
    const authorName = _.escape(metadata.uploader)
    const content = `
    <html>
      <head>
        <title>${escapedTitle}</title>
        <meta property="og:image" content="${thumbnail}" />
        <meta property="og:image:secure_url" content="${thumbnail}" />
        <meta property="og:title" content="${escapedTitle}" />
        <meta property="og:description" content="${metadata.description}" />
        <meta property="og:article:author" content="${authorName}" />
        <meta property="og:site_name" content="Piped Video" />
        <meta property="article:published_time" content="${metadata.uploadDate}" />
        <meta property="og:type" content="video" />
      </head>
      <body>
      <iframe width="${width}" height="${height}" src="${src}" title="${escapedTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p><a href="${url}" target="_blank">${escapedTitle}</a></p>
        <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="https://piped.video${metadata.uploaderUrl}" target="_blank">${authorName}</a></p>
      </body>
    </html>`

    return { content, title }
  }
}
