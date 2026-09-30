/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { XMLParser } from 'fast-xml-parser'
import { parseRss } from './rss'
import { parseHTML } from 'linkedom'
import { JSDOM } from 'jsdom'
import { convertAtomStream } from './atom'
import { OmnivoreContentFeed } from '../../../../../types/Feeds'

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  ignoreDeclaration: false,
  ignorePiTags: false,
  processEntities: {
    maxTotalExpansions: Infinity,
  },
})

export const removeHTMLTag = (text: string): string => {
  const replacedHtmlTags = text.replace(
    /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g,
    ''
  )

  const translatedSymbols: Record<string, string> = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>',
  }

  return replacedHtmlTags
    .replace(
      /&(nbsp|amp|quot|lt|gt);/g,
      (_match, entity) => translatedSymbols[entity]
    )
    .replace(/&#(\d+);/gi, (_match, numStr) =>
      String.fromCharCode(parseInt(numStr, 10))
    )
}

export const getFirstParagraphForEmbedding = (text: string): string => {
  const html = parseHTML(`<html>${text}</html>`)
  return (
    (html.document.querySelectorAll('p')[0] &&
      removeHTMLTag(html.document.querySelectorAll('p')[0].innerHTML)
        .split(' ')
        .slice(0, 15)
        .join(' ')) ||
    ''
  )
}

export const sanitizeHtml = (html: string) => {
  return html
    .replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/gim, '')
    ?.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gim, '')
}

export const streamHeadAndRetrieveOpenGraph = async (link: string) => {
  const html = await fetch(link).then((response) => {
    if (response.body) {
      const reader = response.body.getReader()

      // Read chunks of data
      let html = ''
      const read = (): Promise<string> => {
        return reader.read().then(async ({ done, value }) => {
          if (done) {
            return html
          }

          html += new TextDecoder().decode(value)
          if (html.includes('</head>')) {
            await reader.cancel()
            return `${html.slice(0, html.indexOf('</head>') + 7)}</html>`
          }
          return read()
        })
      }

      // Start reading the stream
      return read()
    }
  })

  if (html) {
    const dom = new JSDOM(sanitizeHtml(html))
    const description =
      dom?.window?.document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') ?? undefined
    const image =
      dom?.window?.document
        ?.querySelector('meta[property="og:image"]')
        ?.getAttribute('content') ?? undefined

    return {
      image,
      description,
    }
  }

  return {
    image: undefined,
    description: undefined,
  }
}

export const parseAtomOrRss = (contentFeed: OmnivoreContentFeed) => {
  const parsedXml = parser.parse(contentFeed.content)
  return parsedXml.rss || parsedXml['rdf:RDF']
    ? parseRss(contentFeed.feed)(
        parsedXml.rss?.channel?.item ||
          parsedXml['rdf:RDF'].channel?.item ||
          parsedXml['rdf:RDF'].item
      )
    : convertAtomStream(contentFeed.feed)(parsedXml)
}
