import { TheAtlanticHandler } from '../src/websites/the-atlantic-handler'
import fs from 'fs';
import nock from 'nock'

describe('Testing the atlantic opening', () => {
  const load = (path: string): string => {
    return fs.readFileSync(path, 'utf8')
  }
  
  
  before(() => {
    const html = load('./test/data/the-atlantic-article.html');
    nock('https://theatlantic.com').get('/article/').reply(200, html)
  })

  it('should parse the title of the atlantic article.', async () => {
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article/'
    );

    // We grab the title from the doucment. 
    expect(response.title).not.toBeFalsy()
  })

  it('should remove the article section, and replace it with a parseable div', async () => {
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article/'
    );

    // We grab the title from the doucment. 
    expect(response.dom?.querySelector('[data-event-module="article body"]')).toBeEmptyDOMElement()
  });

  it ('should append a new div, and add the article content inside', async() => { 
    const response = await new TheAtlanticHandler().preHandle(
      'https://theatlantic.com/article/'
    );

    // We grab the title from the doucment. 
    expect(response.dom?.getElementById('prehandled')).not.toBeEmptyDOMElement()
  })
})
