import { ContentHandler } from '../content-handler'

export class StackOverflowHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'stackoverflow'
  }

  parseVotes(element: Element, dom: Document, title: string) {
    const votes = element.querySelector(`div[itemprop='upvoteCount']`)
    if (votes) {
      const newVotes = dom.createElement('div')
      newVotes.innerHTML = `<h3>${title}: ${votes.innerHTML}votes</h3>`
      element.prepend(newVotes)
    }
  }

  parseComments(element: Element, dom: Document) {
    // comments
    const commentsDiv = element.querySelector(`.comments`)
    if (commentsDiv) {
      const comments = commentsDiv.querySelectorAll(`.comment`)
      if (comments.length > 0) {
        const count = element.querySelector(
          `span[itemprop='commentCount']`
        )?.textContent

        const newComments = dom.createElement('div')
        newComments.innerHTML = `<h3>${
          count ? count + ' Comments' : 'Comment'
        }</h3>`

        comments.forEach((comment) => {
          const author = comment.querySelector(`.comment-user`)
          const text = comment.querySelector(`.comment-copy`)?.textContent
          const authorHref = author?.getAttribute('href')
          const date = comment.querySelector(`.relativetime-clean`)?.textContent
          const link = comment
            .querySelector(`.comment-link`)
            ?.getAttribute('href')
          if (author && text && authorHref && date && link) {
            const newComment = dom.createElement('p')
            newComment.innerHTML = `<a href="${authorHref}">${author.innerHTML}</a>: ${text} - <a href="${link}">${date}</a>`
            newComments.appendChild(newComment)
          }
        })
        commentsDiv.parentNode?.replaceChild(newComments, commentsDiv)
      }
    }

    // remove comment count
    element.querySelector(`span[itemprop='commentCount']`)?.remove()
  }

  shouldPreParse(url: string, dom: Document): boolean {
    return new URL(url).hostname.endsWith('stackoverflow.com')
  }

  async preParse(url: string, dom: Document): Promise<Document> {
    const mainEntity = dom.querySelector(`div[itemprop='mainEntity']`)
    if (mainEntity) {
      const question = mainEntity.querySelector('.question')
      if (question) {
        this.parseVotes(question, dom, 'Question')
        this.parseComments(question, dom)
      }

      const answersDiv = mainEntity.querySelector('#answers')
      if (answersDiv) {
        const count = mainEntity.querySelector(
          `span[itemprop='answerCount']`
        )?.textContent
        const newAnswers = dom.createElement('div')
        newAnswers.innerHTML = `<h3>${
          count ? count + ' Answers' : 'Answer'
        }</h3>`

        const answers = answersDiv.querySelectorAll(`.answer`)
        answers.forEach((answer) => {
          const title = answer.classList.contains('accepted-answer')
            ? 'Accepted Answer'
            : 'Answer'
          this.parseVotes(answer, dom, title)
          this.parseComments(answer, dom)
          newAnswers.appendChild(answer)
        })
        answersDiv.replaceChildren(newAnswers)
      }
    }

    return Promise.resolve(dom)
  }
}
