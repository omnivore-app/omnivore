import { expect } from 'chai'
import 'mocha'
import { ContentReader, PageType } from '../../src/generated/graphql'
import { contentReaderForLibraryItem } from '../../src/utils/uploads'

describe('contentReaderForPage', () => {
  it('returns web if there is no uploadFileId', () => {
    const result = contentReaderForLibraryItem(PageType.Book, undefined)
    expect(result).to.eq(ContentReader.Web)
  })
  it('returns Epub if there is an uploadFileId and type is book', () => {
    const result = contentReaderForLibraryItem(
      PageType.Book,
      'fakeUploadFileId'
    )
    expect(result).to.eq(ContentReader.Epub)
  })
  it('returns PDF if there is an uploadFileId and type is File', () => {
    const result = contentReaderForLibraryItem(
      PageType.File,
      'fakeUploadFileId'
    )
    expect(result).to.eq(ContentReader.Pdf)
  })
})
