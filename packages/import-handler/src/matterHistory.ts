/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { parse } from '@fast-csv/parse'
import { Stream } from 'stream'
import unzip from 'unzip-stream'
import fs from 'fs'
import path from 'path'
import * as fsExtra from 'fs-extra'

import { parseHTML } from 'linkedom'
import { Readability } from '@omnivore/readability'
import createDOMPurify, { SanitizeElementHookEvent } from 'dompurify'

import { encode } from 'urlsafe-base64'
import crypto from 'crypto'
import { ImportContext } from '.'

export type UrlHandler = (url: URL) => Promise<void>

export const importMatterHistoryCsv = async (
  stream: Stream,
  ctx: ImportContext
): Promise<void> => {
  const parser = parse({
    headers: true,
    strictColumnHandling: false,
  })
  stream.pipe(parser)

  for await (const row of parser) {
    try {
      const url = new URL(row['URL'])
      await ctx.urlHandler(ctx, url)
      ctx.countImported += 1
    } catch (error) {
      console.log('invalid url', row, error)
      ctx.countFailed += 1
    }
  }
}

const DOM_PURIFY_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  FORBID_ATTR: [
    'data-ml-dynamic',
    'data-ml-dynamic-type',
    'data-orig-url',
    'data-ml-id',
    'data-ml',
    'data-xid',
    'data-feature',
  ],
}

function domPurifySanitizeHook(node: Element, data: SanitizeElementHookEvent) {
  if (data.tagName === 'iframe') {
    const urlRegex = /^(https?:)?\/\/www\.youtube(-nocookie)?\.com\/embed\//i
    const src = node.getAttribute('src') || ''
    const dataSrc = node.getAttribute('data-src') || ''

    if (src && urlRegex.test(src)) {
      return
    }

    if (dataSrc && urlRegex.test(dataSrc)) {
      node.setAttribute('src', dataSrc)
      return
    }

    node.parentNode?.removeChild(node)
  }
}

function getPurifiedContent(html: string) {
  const newWindow = parseHTML('')
  const DOMPurify = createDOMPurify(newWindow)
  DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
  const clean = DOMPurify.sanitize(html, DOM_PURIFY_CONFIG)
  return parseHTML(clean).document
}

function createImageProxyUrl(url: string, width = 0, height = 0) {
  if (process.env.IMAGE_PROXY_URL && process.env.IMAGE_PROXY_SECRET) {
    const urlWithOptions = `${url}#${width}x${height}`
    const signature = signImageProxyUrl(urlWithOptions)

    return `${process.env.IMAGE_PROXY_URL}/${width}x${height},s${signature}/${url}`
  }
  return url
}

function signImageProxyUrl(url: string) {
  if (process.env.IMAGE_PROXY_SECRET) {
    return encode(
      crypto
        .createHmac('sha256', process.env.IMAGE_PROXY_SECRET)
        .update(url)
        .digest()
    )
  }
  return url
}

async function getReadabilityResult(url: string, originalContent: string) {
  const document = getPurifiedContent(originalContent)

  try {
    const article = await new Readability(document, {
      createImageProxyUrl,
      url,
    }).parse()

    if (article) {
      return article
    }
  } catch (error) {
    console.log('parsing error for url', url, error)
  }

  return null
}

const unarchive = async (stream: Stream): Promise<string> => {
  const archiveDir = `./archive-${Date.now().toString(16)}`
  await fsExtra.emptyDir(archiveDir)

  return new Promise((resolve, reject) => {
    stream
      .pipe(unzip.Extract({ path: archiveDir }))
      .on('close', () => {
        resolve(archiveDir)
      })
      .on('error', reject)
  })
}

const getMatterHistoryContent = (
  archiveDir: string,
  row: Record<string, string>
) => {
  try {
    const contentKey = row['File Id']
    const contentPath = path.join(archiveDir, contentKey)
    const content = fs.readFileSync(contentPath).toString()

    return content
  } catch (err) {
    console.log('error getting matter history content: ', { row, err })
  }
  return undefined
}

const getURL = (str: string | undefined) => {
  if (!str) {
    return undefined
  }

  try {
    const url = new URL(str)
    return url
  } catch (err) {
    console.log('error parsing url', { str, err })
  }

  return undefined
}

const handleMatterHistoryRow = async (
  ctx: ImportContext,
  archiveDir: string,
  row: Record<string, string>
) => {
  const title = row['Title']
  const urlStr = row['URL']
  const url = getURL(urlStr)

  if (!url) {
    ctx.countFailed += 1
    return
  }

  const originalContent = getMatterHistoryContent(archiveDir, row)
  const readabilityResult = originalContent
    ? await getReadabilityResult(urlStr, originalContent)
    : null

  if (originalContent && readabilityResult) {
    await ctx.contentHandler(
      ctx,
      url,
      title,
      originalContent,
      readabilityResult
    )
  } else {
    await ctx.urlHandler(ctx, url)
  }
}

export const importMatterArchive = async (
  stream: Stream,
  ctx: ImportContext
): Promise<void> => {
  const archiveDir = await unarchive(stream)

  try {
    const historyFile = path.join(archiveDir, '_matter_history.csv')

    const parser = parse({
      headers: true,
      strictColumnHandling: false,
    })

    fs.createReadStream(historyFile).pipe(parser)

    for await (const row of parser) {
      try {
        await handleMatterHistoryRow(ctx, archiveDir, row)
        ctx.countImported += 1
      } catch (error) {
        console.log('invalid url', row, error)
        ctx.countFailed += 1
      }
    }
  } catch (err) {
    console.log('error handling archive: ', { err })
  } finally {
    try {
      await fsExtra.rm(archiveDir, { recursive: true, force: true })
    } catch (err) {
      console.log('Error removing archive directory', { err })
    }
  }
}
