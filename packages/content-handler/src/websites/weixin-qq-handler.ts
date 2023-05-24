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
      const dateTimeFormat = 'yyyy-LL-dd HH:mm'
      // convert the publish time to a string in the format of "2023-01-01 00:00" in GMT+8
      const publishTimeInGMT8 = DateTime.fromFormat(publishTime, dateTimeFormat)
        .setZone('Asia/Shanghai')
        .toFormat(dateTimeFormat)
      // replace the publish time in the dom
      dom.querySelector('#publish_time')?.replaceWith(publishTimeInGMT8)
    }
    // This replace the class name of the article info to preserve the block
    dom
      .querySelector('.rich_media_meta_list')
      ?.setAttribute('class', '_omnivore_rich_media_meta_list')

    // This removes the title
    dom.querySelector('.rich_media_title')?.remove()

    // This removes the profile info
    dom.querySelector('.profile_container')?.remove()

    //  This removes the footer
    dom.querySelector('#content_bottom_area')?.remove()
    dom.querySelector('.rich_media_area_extra')?.remove()
    dom.querySelector('#js_pc_qr_code')?.remove()

    return Promise.resolve(dom)
  }
}
