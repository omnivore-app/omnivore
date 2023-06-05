import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { contentReaderForPage } from '../../src/utils/uploads'
import { ContentReader, PageType } from '../../src/generated/graphql'

describe('contentReaderForPage', () => {
  it('returns web if there is no uploadFileId', () => {
    const result = contentReaderForPage(PageType.Book, undefined)
    expect(result).to.eq(ContentReader.Web)
  })
  it('returns Epub if there is an uploadFileId and type is book', () => {
    const result = contentReaderForPage(PageType.Book, 'fakeUploadFileId')
    expect(result).to.eq(ContentReader.Epub)
  })
  it('returns PDF if there is an uploadFileId and type is File', () => {
    const result = contentReaderForPage(PageType.File, 'fakeUploadFileId')
    expect(result).to.eq(ContentReader.Pdf)
  })
})
