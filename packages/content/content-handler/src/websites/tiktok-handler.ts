import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import _ from 'underscore'

const getRedirectUrl = async (url: string): Promise<string | undefined> => {
  try {
    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    })
    return response.headers.location
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.response && error.response.headers.location) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return error.response.headers.location as string
    }
    return undefined
  }
}

const escapeTitle = (title: string) => {
  return _.escape(title)
}

export class TikTokHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'TikTok'
  }

  shouldPreHandle(url: string): boolean {
    const u = new URL(url)
    return u.hostname.endsWith('tiktok.com')
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    let fetchUrl = url
    const u = new URL(url)
    if (
      u.hostname.startsWith('vm.tiktok.com') ||
      u.hostname.startsWith('vt.tiktok.com')
    ) {
      // Fetch the full URL
      const redirectedUrl = await getRedirectUrl(url)
      if (!redirectedUrl) {
        throw new Error('Could not fetch redirect URL for: ' + url)
      }
      fetchUrl = redirectedUrl
    }

    const oembedUrl =
      `https://www.tiktok.com/oembed?format=json&url=` +
      encodeURIComponent(fetchUrl)
    const oembed = (await axios.get(oembedUrl.toString())).data as {
      title: string
      width: number
      height: number
      html: string
      thumbnail_url: string
      author_name: string
      author_url: string
    }
    console.log('oembed results: ', oembed)
    // escape html entities in title
    const title = oembed.title
    const escapedTitle = escapeTitle(title)
    const ratio = oembed.width / oembed.height
    const thumbnail = oembed.thumbnail_url
    const height = 350
    const width = height * ratio
    const authorName = _.escape(oembed.author_name)
    // <p><a href="${url}" target="_blank">${escapedTitle}</a></p>
    const content = `
    <html>
      <head><title>TikTok page</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${escapedTitle}" />
      <meta property="og:description" content="" />
      <meta property="og:article:author" content="${authorName}" />
      <meta property="og:site_name" content="TikTok" />
      <meta property="og:type" content="video" />
      </head>
      <body>
      <div>
        <article id="_omnivore_tiktok">
          <div id="_omnivore_tiktok_video">
          ${oembed.html}
          </div>
          <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${authorName}</a></p>
        </article>
      </div>
      </body>
    </html>`

    console.log('content, title', title, content)

    return { content, title }
  }
}
