import { expect } from 'chai'
import fs from 'fs'
import 'mocha'
import nock from 'nock'
import path from 'path'
import { fetchAllImageSizes, findThumbnail } from '../src'

describe('findThumbnail', () => {
  it('finds the largest and squarest image', async () => {
    const images = ['large_and_square', 'small', 'sprite', 'wide']
    // mock getting image by url
    images.forEach((image) => {
      nock('https://omnivore.app')
        .get(`/${image}.png`)
        .replyWithFile(200, path.join(__dirname, 'fixtures', `${image}.png`))
    })
    // get html content from file
    const content = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'findThumbnail.html'),
      'utf8'
    )
    // find thumbnail
    const imageSizes = await fetchAllImageSizes(content)
    const thumbnail = findThumbnail(imageSizes)

    expect(thumbnail).to.eql('https://omnivore.app/large_and_square.png')
  })
})
