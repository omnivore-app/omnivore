import { ContentHandler, PreHandleResult } from '../index'
import axios from 'axios'
import _ from 'underscore'

const YOUTUBE_URL_MATCH =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

function getYoutubeVideoId(url: string) {
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

class YoutubeHandler extends ContentHandler {
  shouldPreHandle(url: string, _dom: Document): boolean {
    return YOUTUBE_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string, _document: Document): Promise<PreHandleResult> {
    const videoId = getYoutubeVideoId(url)
    if (!videoId) {
      return {}
    }

    const oembedUrl =
      `https://www.youtube.com/oembed?format=json&url=` +
      encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)
    const oembed = (await axios.get(oembedUrl.toString())).data as {
      title: string
      width: number
      height: number
      thumbnail_url: string
      author_name: string
      author_url: string
    }
    // escape html entities in title
    const title = _.escape(oembed.title)
    const ratio = oembed.width / oembed.height
    const thumbnail = oembed.thumbnail_url
    const height = 350
    const width = height * ratio
    const authorName = _.escape(oembed.author_name)

    const content = `
    <html>
      <head><title>${title}</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="" />
      <meta property="og:article:author" content="${authorName}" />
      </head>
      <body>
      <iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p><a href="${url}" target="_blank">${title}</a></p>
        <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${authorName}</a></p>
      </body>
    </html>`

    console.log('got video id', videoId)

    return { content, title: 'Youtube Content' }
  }
}
