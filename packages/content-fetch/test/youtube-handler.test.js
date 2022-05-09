const { expect } = require('chai')
const { youtubeHandler } = require('../youtube-handler')

describe('getVideoId', () => {
  it('should parse video id out of a URL', async () => {
    expect('BnSUk0je6oo').to.eq(youtubeHandler.getVideoId('https://www.youtube.com/watch?v=BnSUk0je6oo&t=269s'));
    expect('vFD2gu007dc').to.eq(youtubeHandler.getVideoId('https://www.youtube.com/watch?v=vFD2gu007dc&list=RDvFD2gu007dc&start_radio=1'));
    expect('vFD2gu007dc').to.eq(youtubeHandler.getVideoId('https://youtu.be/vFD2gu007dc'));
    expect('BMFVCnbRaV4').to.eq(youtubeHandler.getVideoId('https://youtube.com/watch?v=BMFVCnbRaV4&feature=share'));
    expect('cg9b4RC87LI').to.eq(youtubeHandler.getVideoId('https://youtu.be/cg9b4RC87LI?t=116'));
  })
})
