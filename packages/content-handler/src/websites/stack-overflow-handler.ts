import { ContentHandler } from '../content-handler'

export class StackOverflowHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'stackoverflow'
  }

  parseText(element: Element, title: string) {
    const newText = element.ownerDocument.createElement('div')
    const text = element.querySelector(`div[itemprop='text']`)
    if (text) {
      const votes = element
        .querySelector(`div[itemprop='upvoteCount']`)
        ?.getAttribute('data-value')

      if (votes) {
        newText.innerHTML = `<h2>${title}: ${votes} vote${
          votes === '1' ? '' : 's'
        }</h2>${text.innerHTML}`
      }
    }
    return newText
  }

  parseComments(element: Element) {
    const dom = element.ownerDocument
    const newComments = dom.createElement('div')

    // comments
    const commentsDiv = element.querySelector(`.comments`)
    if (commentsDiv) {
      const comments = commentsDiv.querySelectorAll(`.comment`)
      if (comments.length > 0) {
        newComments.innerHTML = `<h3>Comments</h3>`

        comments.forEach((comment) => {
          const author = comment.querySelector(`.comment-user`)
          const text = comment.querySelector(`.comment-copy`)?.textContent
          const authorHref = author?.getAttribute('href')
          const date = comment.querySelector(`.relativetime-clean`)?.textContent
          if (author && text && authorHref && date) {
            const newComment = dom.createElement('p')
            newComment.innerHTML = `<a href="${authorHref}"><b>${author.innerHTML}</b></a>: ${text} - ${date}`
            newComments.appendChild(newComment)
          }
        })
      }
    }

    return newComments
  }

  parseAuthors(element: Element) {
    const dom = element.ownerDocument
    const newAuthors = dom.createElement('div')

    const authors = element.querySelectorAll(`.post-signature`)
    authors.forEach((author) => {
      const isOwner = author.classList.contains('owner')
      const name = author.querySelector(`.user-details a`)?.textContent
      const link = author.querySelector(`.user-details a`)?.getAttribute('href')
      const reputation = author.querySelector(`.reputation-score`)?.textContent
      const badges = Array.from(
        author.querySelectorAll(`span[title*='badges']`),
      )
        .map((badge) => badge.getAttribute('title'))
        .join(', ')
      const date = author.querySelector(`.user-action-time`)?.textContent
      if (name && link && reputation && date) {
        const newAuthor = dom.createElement('p')
        newAuthor.innerHTML = `<a href="${link}"><b>${name}</b></a> - ${reputation} reputation - ${
          badges || 'no badge'
        } - ${date}`
        if (isOwner) {
          const author = dom.createElement('span')
          author.setAttribute('rel', 'author')
          author.innerHTML = name
          newAuthor.appendChild(author)
        }
        newAuthors.appendChild(newAuthor)
      }
    })

    return newAuthors
  }

  shouldPreParse(url: string, dom: Document): boolean {
    return new URL(url).hostname.endsWith('stackoverflow.com')
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    const mainEntity = dom.querySelector(`div[itemprop='mainEntity']`)
    if (mainEntity) {
      const newMainEntity = dom.createElement('div')
      const question = mainEntity.querySelector('#question')
      if (question) {
        newMainEntity.appendChild(this.parseText(question, 'Question'))
        newMainEntity.appendChild(this.parseAuthors(question))
        newMainEntity.appendChild(this.parseComments(question))
      }

      const answersDiv = mainEntity.querySelector('#answers')
      if (answersDiv) {
        const answers = answersDiv.querySelectorAll(`.answer`)
        answers.forEach((answer) => {
          const title = answer.classList.contains('accepted-answer')
            ? 'Accepted Answer'
            : 'Answer'
          newMainEntity.appendChild(this.parseText(answer, title))
          newMainEntity.appendChild(this.parseAuthors(answer))
          newMainEntity.appendChild(this.parseComments(answer))
        })
      }

      dom.body.replaceChildren(newMainEntity)
    }

    return Promise.resolve(dom)
  }
}
