import 'mocha'
import { expect } from 'chai'
import {
  isYouTubeVideoURL,
  videoIdFromYouTubeUrl,
} from '../../src/utils/youtube'

describe('videoIdFromYouTubeUrl', () => {
  it('Returns video id for video with playlist id', () => {
    const result = videoIdFromYouTubeUrl(
      'https://www.youtube.com/watch?v=kfchvCyHmsc&list=PLDyKn8uKYtRalFdBWtv_EjDtUo2UEbu-a'
    )
    expect(result).to.eq('kfchvCyHmsc')
  })

  it('Returns video id for direct url', () => {
    const result = videoIdFromYouTubeUrl(
      'https://www.youtube.com/v/vLfAtCbE_Jc'
    )
    expect(result).to.eq('vLfAtCbE_Jc')
  })

  it('Returns video id for standard url', () => {
    const result = videoIdFromYouTubeUrl(
      'https://www.youtube.com/watch?v=vLfAtCbE_Jc'
    )
    expect(result).to.eq('vLfAtCbE_Jc')
  })

  it('Returns video id for short url', () => {
    const result = videoIdFromYouTubeUrl('https://youtu.be/vLfAtCbE_Jc')
    expect(result).to.eq('vLfAtCbE_Jc')
  })

  it('Returns video id for short url with share id', () => {
    const result = videoIdFromYouTubeUrl(
      'https://youtu.be/iZxR7rPdvuQ?si=ad73DTmmXL_lbn31'
    )
    expect(result).to.eq('iZxR7rPdvuQ')
  })

  it('Returns video id for embed url', () => {
    const result = videoIdFromYouTubeUrl(
      'https://www.youtube.com/embed/vLfAtCbE_Jc'
    )
    expect(result).to.eq('vLfAtCbE_Jc')
  })

  it('Returns undefined for non-youtube url', () => {
    const result = videoIdFromYouTubeUrl(
      'https://omnivore.app/iZxR7rPdvuQ?si=ad73DTmmXL_lbn31'
    )
    expect(result).to.eq(undefined)
  })

  it('Returns undefined for non-youtube short url', () => {
    const result = videoIdFromYouTubeUrl('https://omnivore.app/?v=iZxR7rPdvuQ')
    expect(result).to.eq(undefined)
  })

  it('Returns video id when port is added', () => {
    const result = videoIdFromYouTubeUrl(
      'https://www.youtube.com:443/watch?v=kfchvCyHmsc'
    )
    expect(result).to.eq('kfchvCyHmsc')
  })
})

describe('isYouTubeVideoURL', () => {
  it('Returns false for a shorts URL', () => {
    const result = isYouTubeVideoURL(
      'https://www.youtube.com/shorts/ZsQKYwXbo4s'
    )
    expect(result).to.eq(false)
  })
  it('Returns false for a non-youtube URL', () => {
    const result = isYouTubeVideoURL('https://omnivore.app/about')
    expect(result).to.eq(false)
  })
  it('Returns true for a video URL', () => {
    const result = isYouTubeVideoURL(
      'https://www.youtube.com/watch?v=p4YOXmm839c'
    )
    expect(result).to.eq(true)
  })
})
