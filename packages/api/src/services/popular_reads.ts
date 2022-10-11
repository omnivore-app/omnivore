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
  previewImage?: string
  publishedAt: Date
  siteName: string

  content: string
  originalHtml: string
}

interface AddPopularReadResult {
  pageId?: string
  name: string
  status: ArticleSavingRequestStatus
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

const addPopularReads = async (
  userId: string,
  ...names: string[]
): Promise<AddPopularReadResult[]> => {
  const results: AddPopularReadResult[] = []
  for (const name of names) {
    const pageId = await addPopularRead(userId, name)
    results.push({
      pageId,
      name,
      status: pageId
        ? ArticleSavingRequestStatus.Succeeded
        : ArticleSavingRequestStatus.Failed,
    })
  }
  return results
}

export const addPopularReadsForNewUser = async (
  userId: string,
  isIOSUser = false
): Promise<void> => {
  await addPopularReads(
    userId,
    'omnivore_get_started',
    'power_read_it_later',
    'omnivore_organize',
    isIOSUser ? 'omnivore_ios' : 'omnivore_android'
  )
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
    key: 'omnivore_organize',
    url: 'https://blog.omnivore.app/p/organize-your-omnivore-library-with',
    title: 'Organize your Omnivore library with labels',
    author: 'The Omnivore Team',
    description: 'Use labels to organize your Omnivore library.',
    previewImage:
      'https://proxy-prod.omnivore-image-cache.app/88x88,sSLRtT7zJbaNFEUbqDe9jbr3nloPsdjaqQXUqISk_x7E/https://substackcdn.com/image/fetch/w_1200,h_600,c_limit,f_jpg,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4ec9f3c-baef-464b-8d3a-0b8a384874d3_960x711.gif',
    publishedAt: new Date('2022-04-18'),
    siteName: 'Omnivore Blog',
  },
  {
    key: 'rlove_carnitas',
    url: 'https://medium.com/@rlove/carnitas-ff0ef1044ae9',
    title: 'Slow-Braised Carnitas Recipe',
    author: 'Robert Love',
    description:
      'Carnitas is a wonderful Mexican dish, pork shoulder cooked until tender and then given a great crisp. In Mexico, carnitas is eaten on its own, in tacos, or in tortas. This is not an authentic recipe.',
    previewImage:
      'https://proxy-prod.omnivore-image-cache.app/88x88,sIcDXt3Ar0baKG1e1Yi1e2VUZFL85xPlOeEfAxF-s-Nw/https://miro.medium.com/max/1200/1*Wl-dMBJpSgPUxUOnPQthyg.jpeg',
    publishedAt: new Date('2017-02-24'),
    siteName: '@rlove',
  },
  {
    key: 'power_read_it_later',
    url: 'https://fortelabs.co/blog/the-secret-power-of-read-it-later-apps',
    title: 'The Secret Power of ‘Read It Later’ Apps',
    author: 'Tiago Forte',
    description:
      'At the end of 2014 I received an email informing me that I had read over a million words in the ‘read it later’ app Pocket',
    previewImage:
      'https://proxy-prod.omnivore-image-cache.app/88x88,sVITWrJo3Wdi5LY3qSXX9aGytwKKteF8bth4z1MNz-PI/https://i0.wp.com/fortelabs.co/wp-content/uploads/2015/11/1rPXwIczUJRCE54v8FfAHGw.jpeg?fit=2000%2C844&ssl=1',
    publishedAt: new Date('2022-01-24'),
    siteName: 'Forte Labs',
  },
  {
    key: 'elad_meetings',
    url: 'http://blog.eladgil.com/2018/07/meeting-etiquette.html',
    title: 'Better Meetings',
    author: 'Elad Gil',
    description: 'How to make meetings more productive.',
    publishedAt: new Date('2018-07-02'),
    siteName: 'Elad Blog',
  },
  {
    key: 'jonbo_digital_tools',
    url: 'https://jon.bo/posts/digital-tools/',
    title: 'Digital Tools I Wish Existed',
    author: 'Jonathan Borichevskiy',
    description: `My digital life in a nutshell: I discover relevant content I don’t have time to consume...`,
    publishedAt: new Date('2019-11-28'),
    siteName: 'JON.BO',
  },
]
