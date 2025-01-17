import { DateTime } from 'luxon'
import { ContentHandler } from '../content-handler'

export class WeixinQqHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Weixin QQ'
  }

  shouldPreParse(url: string, dom: Document): boolean {
    return new URL(url).hostname.endsWith('weixin.qq.com')
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    // Retrieve the publish time
    const publishTime = dom.querySelector('#publish_time')?.textContent
    if (publishTime) {
      const dateTimeFormat = 'yyyy年LL月dd日 HH:mm'
      // published time is in UTC+8
      const publishTimeISO = DateTime.fromFormat(publishTime, dateTimeFormat, {
        zone: 'Asia/Shanghai',
      }).toISO()

      // create a meta node to store the publish time in ISO format
      const metaNode = dom.createElement('meta')
      metaNode.setAttribute('name', 'date')
      if (publishTimeISO) {
        metaNode.setAttribute('content', publishTimeISO)
      }
      dom.querySelector('head')?.appendChild(metaNode)
    }

    const author = (
      dom.querySelector('#js_author_name') || dom.querySelector('#js_name')
    )?.textContent?.trim()
    if (author) {
      const authorNode = dom.createElement('meta')
      authorNode.setAttribute('name', 'author')
      authorNode.setAttribute('content', author)
      dom.querySelector('head')?.appendChild(authorNode)
    }

    // This removes the title, metadata and cover image
    dom.querySelector('.rich_media_title')?.remove()
    dom.querySelector('.rich_media_meta_list')?.remove()
    dom.querySelector('#js_row_immersive_cover_img')?.remove()

    // This removes the profile info
    dom.querySelector('.profile_container')?.remove()
    dom.querySelector('.profile_card_container')?.remove()

    //  This removes the footer
    dom.querySelector('#content_bottom_area')?.remove()
    dom.querySelector('.rich_media_area_extra')?.remove()
    dom.querySelector('#js_pc_qr_code')?.remove()

    return Promise.resolve(dom)
  }
}
