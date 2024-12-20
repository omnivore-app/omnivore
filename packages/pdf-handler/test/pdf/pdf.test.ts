import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import {
  getDocument,
  getDocumentText,
  getDocumentTitle,
  parsePdf,
} from '../../src/pdf'

chai.use(chaiString)

describe('open a simple PDF with a set title', () => {
  it('should return the title', async () => {
    const doc = await getDocument('./test/pdf/data/pdf-simple-test.pdf')
    const result = await getDocumentTitle(doc)
    expect('Document1').to.equal(result)
  })
  it('should return the document text', async () => {
    const doc = await getDocument('./test/pdf/data/pdf-simple-test.pdf')
    const result = await getDocumentText(doc)
    expect(result).to.equal(
      'This is the page title\n\nThis is some more text\n'
    )
  })
})

describe('open a complex PDF with no title', () => {
  it('should return some initial content as the title', async () => {
    const doc = await getDocument('./test/pdf/data/pdf-complex-test.pdf')
    const result = await getDocumentTitle(doc)
    console.log(result);
    expect(result).to.startWith(
      'Improving communications'
    )
  })

  it('should be less than the max title length', async () => {
    const doc = await getDocument('./test/pdf/data/pdf-complex-test.pdf')
    const result = await getDocumentTitle(doc)
    expect(result?.length).to.lessThanOrEqual(95)
  })
})

describe('open a PDF with metadata set', () => {
  it('should return metadata', async () => {
    const parsed = await parsePdf(
      new URL('file://' + __dirname + '/data/welcome_to_your_library.pdf')
    )

    expect(parsed.title).to.eq('Welcome to your Omnivore Library')
    expect(parsed.author).to.eq('Jackson Harper')
    expect(parsed.description).to.eq('This is the description of my PDF')
  })
})
