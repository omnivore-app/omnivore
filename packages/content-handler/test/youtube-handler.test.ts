import { expect } from 'chai'
import 'mocha'
import { getYoutubeVideoId } from '../src/youtube-handler'

describe('getYoutubeVideoId', () => {
  it('should parse video id out of a URL', async () => {
    expect('BnSUk0je6oo').to.eq(
      getYoutubeVideoId('https://www.youtube.com/watch?v=BnSUk0je6oo&t=269s')
    )
    expect('vFD2gu007dc').to.eq(
      getYoutubeVideoId(
        'https://www.youtube.com/watch?v=vFD2gu007dc&list=RDvFD2gu007dc&start_radio=1'
      )
    )
    expect('vFD2gu007dc').to.eq(
      getYoutubeVideoId('https://youtu.be/vFD2gu007dc')
    )
    expect('BMFVCnbRaV4').to.eq(
      getYoutubeVideoId('https://youtube.com/watch?v=BMFVCnbRaV4&feature=share')
    )
    expect('cg9b4RC87LI').to.eq(
      getYoutubeVideoId('https://youtu.be/cg9b4RC87LI?t=116')
    )
  })
})
