import { GitHubHandler } from '../src/websites/github-handler'
import 'mocha'
import { expect } from 'chai'
import { parseHTML } from 'linkedom'

describe('preParse', () => {
  it('should update the title on the page', async () => {
    const dom = parseHTML(
      `
      <html>
        <head>
          <meta name="twitter:title"
                content="GitHub - owner/repo: This is a title with a / char"
          />
        </head>
        <body>
          <article>this is the content of the article</article>
        </body>
      </html>
      `
    )
    const result = await new GitHubHandler().preParse(
      'https://github.com/siyuan-note/siyuan',
      dom.document
    )
    const title = result
      .querySelector(`meta[name='twitter:title']`)
      ?.getAttribute('content')

    expect(title).to.eq(`repo: This is a title with a / char`)
  })
})
