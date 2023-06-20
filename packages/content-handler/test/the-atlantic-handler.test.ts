import { TheAtlanticHandler } from '../src/websites/the-atlantic-handler'
import fs from 'fs';
import nock from 'nock'
import { expect } from 'chai'

describe('Testing the atlantic opening', () => {
  const load = (path: string): string => {
    return fs.readFileSync(path, 'utf8')
  }
  
  
  before(() => {
    const html = load('./test/data/the-atlantic-article.html');
    nock('https://theatlantic.com').persist().get('/article').reply(200, html)
  })

  it('should parse the title of the atlantic article.', async () => {
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article'
    );

    // We grab the title from the doucment. 
    expect(response.title).not.to.be.undefined
  })

  it('should remove the article section, and replace it with a parseable div', async () => {
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article'
    );

    // This should not exist
    expect(response.dom?.querySelector('[data-event-module="article body"]')).to.be.null
  });

  it ('should append a new div, and add the article content inside', async() => { 
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article'
    );

    // We name the div to ensure we can validate that it has been inserted.
    expect(response.dom?.getElementById('prehandled')).not.to.be.null
  })

  it ('should remove any related content links.', async() => { 
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article'
    );

    // This exists in the HTML, but we remove it when preparsing.
    expect(response.dom?.getElementsByClassName('ArticleRelatedContentModule_root__BBa6g').length).to.eql(0)
  })
})
