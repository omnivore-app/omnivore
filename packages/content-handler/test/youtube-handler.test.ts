import { expect } from "chai";
import "mocha";
import { escapeTitle, getYoutubePlaylistId, getYoutubeVideoId } from "../src/websites/youtube-handler";

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

describe('getYoutubePlaylistId', () => {
  it('should parse playlist id out of a URL', async () => {
    expect('PL6D4F6A0D6B0C6A5E').to.eq(
      getYoutubePlaylistId(
        'https://www.youtube.com/watch?v=BnSUk0je6oo&t=269s&list=PL6D4F6A0D6B0C6A5E'
      )
    )
    expect('RDvFD2gu007dc').to.eq(
      getYoutubePlaylistId(
        'https://www.youtube.com/watch?v=vFD2gu007dc&list=RDvFD2gu007dc&start_radio=1'
      )
    )
    expect('PL6D4F6A0D6B0C6A5E').to.eq(
      getYoutubePlaylistId(
        'https://www.youtube.com/playlist?list=PL6D4F6A0D6B0C6A5E'
      )
    )
    expect('PL6D4F6A0D6B0C6A5E').to.eq(
      getYoutubePlaylistId(
        'https://www.youtube.com/playlist?list=PL6D4F6A0D6B0C6A5E&feature=share'
      )
    )
    expect('PL6D4F6A0D6B0C6A5E').to.eq(
      getYoutubePlaylistId(
        'https://www.youtube.com/playlist?list=PL6D4F6A0D6B0C6A5E&feature=share'
      )
    )
  })
})

describe('escapeTitle', () => {
  it('escapes the special characters in the title', async () => {
    expect(escapeTitle("The Stanley's Parable")).to.eq(
      'The Stanley&#x27;s Parable'
    )
  })
})
