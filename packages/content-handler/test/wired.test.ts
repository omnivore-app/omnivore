import { WiredHandler } from '../src/websites/wired-handler'
import fs from 'fs';
import nock from 'nock'
import { expect } from 'chai'
import { parseHTML } from 'linkedom'


describe('Testing Wired Paywalled Article opening', () => {
  const load = (path: string): string => {
    return fs.readFileSync(path, 'utf8')
  }
  
  before(() => {
    const html = load('./test/data/wired-article.html');
    nock('https://wired.com').persist().get('/article').reply(200, html)
  })

  it('should parse the title of the wired article.', async () => {
    const response = await new WiredHandler().preHandle(
      'https://wired.com/article'
    );

    // We grab the title from the doucment. 
    expect(response.title).not.to.be.undefined
  })

  it('should remove callout', async () => {
    const response = await new WiredHandler().preHandle(
      'https://wired.com/article'
    );
    const html = load('./test/data/wired-article.html');
    const priorDom = parseHTML(html).document;

    expect(priorDom.querySelector('[data-testid="GenericCallout"]')).not.to.be.null
    // Should no longer be the case after pre-rendering.
    expect(response.dom?.querySelector('[data-testid="GenericCallout"]')).to.be.null
  });

  it ('should remove any ad placeholders', async() => { 
    const response = await new WiredHandler().preHandle(
      'https://wired.com/article'
    );

    expect(response.dom?.querySelector('.ad__slot')).to.be.null
  })

  it ('should remove any related content links.', async() => { 
    const response = await new WiredHandler().preHandle(
      'https://wired.com/article'
    );

    // This exists in the HTML, but we remove it when preparsing.
    expect(response.dom?.querySelector('[data-most-popular-id]')).to.be.null;
  })
})
