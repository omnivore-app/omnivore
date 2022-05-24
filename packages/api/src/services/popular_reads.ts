import { createPage } from '../elastic/pages'
import { createPubSubClient } from '../datalayer/pubsub'
import { ArticleSavingRequestStatus, Page, PageContext } from '../elastic/types'
import { PageType } from '../generated/graphql'
import { generateSlug, stringToHash } from '../utils/helpers'
import { readFileSync } from 'fs'
import path from 'path'

type PopularRead = {
  url: string
  title: string
  author: string
  description: string
  previewImage: string
  publishedAt: Date
  siteName: string

  content: string
  originalHtml: string
}

const popularRead = (key: string): PopularRead | undefined => {
  const metadata = popularReads.find((pr) => pr.key === key)
  if (!metadata) {
    return undefined
  }

  const content = readFileSync(
    path.resolve(__dirname, `popular_reads/${key}-content.html`),
    'utf8'
  )
  const originalHtml = readFileSync(
    path.resolve(__dirname, `./popular_reads/${key}-original.html`),
    'utf8'
  )
  if (!content || !originalHtml) {
    return undefined
  }

  return {
    ...metadata,
    content,
    originalHtml,
  }
}

export const addPopularRead = async (
  userId: string,
  name: string
): Promise<string | undefined> => {
  const ctx: PageContext = {
    pubsub: createPubSubClient(),
    refresh: true,
    uid: userId,
  }

  const pr = popularRead(name)
  if (!pr) {
    return undefined
  }

  const saveTime = new Date()
  const slug = generateSlug(pr.title)

  const articleToSave: Page = {
    id: '',
    slug: slug,
    userId: userId,
    content: pr.content,
    originalHtml: pr.originalHtml,
    description: pr.description,
    title: pr.title,
    author: pr.author,
    url: pr.url,
    pageType: PageType.Article,
    hash: stringToHash(pr.content),
    image: pr.previewImage,
    publishedAt: pr.publishedAt,
    savedAt: saveTime,
    createdAt: saveTime,
    siteName: pr.siteName,
    readingProgressPercent: 0,
    readingProgressAnchorIndex: 0,
    state: ArticleSavingRequestStatus.Succeeded,
  }

  const pageId = await createPage(articleToSave, ctx)
  return pageId
}

const popularReads = [
  {
    key: 'omnivore_get_started',
    url: 'https://blog.omnivore.app/p/getting-started-with-omnivore',
    title: 'Getting Started with Omnivore',
    author: 'The Omnivore Team',
    description: 'Get the most out of Omnivore by learning how to use it.',
    previewImage:
      'https://proxy-prod.omnivore-image-cache.app/88x88,sBp_gMyIp8Y4Mje8lzL39vzrBQg5m9KbprssrGjCbbHw/https://substackcdn.com/image/fetch/w_1200,h_600,c_limit,f_jpg,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F658efff4-341a-4720-8cf6-9b2bdbedfaa7_800x668.gif',
    publishedAt: new Date('2021-10-13'),
    siteName: 'Omnivore Blog',
  },
  {
    key: 'omnivire_organize',
    url: 'https://blog.omnivore.app/p/organize-your-omnivore-library-with',
    title: 'Organize your Omnivore library with labels',
    author: 'The Omnivore Team',
    description: 'Use labels to organize your Omnivore library.',
    previewImage:
      'https://proxy-prod.omnivore-image-cache.app/88x88,sSLRtT7zJbaNFEUbqDe9jbr3nloPsdjaqQXUqISk_x7E/https://substackcdn.com/image/fetch/w_1200,h_600,c_limit,f_jpg,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4ec9f3c-baef-464b-8d3a-0b8a384874d3_960x711.gif',
    publishedAt: new Date('2022-04-18'),
    siteName: 'Omnivore Blog',
  },
]
