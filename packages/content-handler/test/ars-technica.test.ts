import { ArsTechnicaHandler } from '../src/websites/ars-technica-handler'
import fs from 'fs'
import nock from 'nock'
import { expect } from 'chai'
import { parseHTML } from 'linkedom'

describe('Testing parsing multi-page articles from arstechnica.', () => {
  let orignalArticle: Document | undefined
  let htmlPg1: string | null
  let htmlPg2: string | null
  let htmlPg3: string | null

  const load = (path: string): string => {
    return fs.readFileSync(path, 'utf8')
  }

  before(() => {
    htmlPg1 = load('./test/data/ars-multipage/ars-technica-page-1.html')
    htmlPg2 = load('./test/data/ars-multipage/ars-technica-page-2.html')
    htmlPg3 = load('./test/data/ars-multipage/ars-technica-page-3.html')

    orignalArticle = parseHTML(htmlPg1).document
  })

  beforeEach(() => {
    nock('https://arstechnica.com').get('/article/').reply(200, htmlPg1!)
    nock('https://arstechnica.com').get('/article/2/').reply(200, htmlPg2!)
    nock('https://arstechnica.com').get('/article/3/').reply(200, htmlPg3!)
  })

  afterEach(() => { 
    nock.cleanAll();
  })

  it('should parse the title of the atlantic article.', async () => {
    const response = await new ArsTechnicaHandler().preHandle(
      'https://arstechnica.com/article/'
    )

    // We grab the title from the doucment.
    expect(response.title).not.to.be.undefined
    expect(response.title).to.equal(
      'What’s going on with the reports of a room-temperature superconductor? | Ars Technica'
    )
  })

  it('should remove the navigation links', async () => {
    const response = await new ArsTechnicaHandler().preHandle(
      'https://arstechnica.com/article/'
    )

    expect(orignalArticle?.querySelector('nav.page-numbers')).not.to.be.null
    expect(response.dom?.querySelectorAll('nav.page-numbers').length).to.equal(0);
  })

  it('should append all new content into the main article', async () => {
    const response = await new ArsTechnicaHandler().preHandle(
      'https://arstechnica.com/article/'
    )

    // We name the div to ensure we can validate that it has been inserted.
    expect(
      orignalArticle?.getElementsByClassName('nextPageContents')?.length || 0
    ).to.equal(0)
    expect(
      response.dom?.getElementsByClassName('nextPageContents')?.length || 0
    ).not.to.equal(0)
  })

  it('should remove any related content links.', async () => {
    const response = await new ArsTechnicaHandler().preHandle(
      'https://arstechnica.com/article/'
    )

    // This exists in the HTML, but we remove it when preparsing.
    expect(
      response.dom?.getElementsByClassName(
        'ArticleRelatedContentModule_root__BBa6g'
      ).length
    ).to.eql(0)
  })
})
