import { logger } from '../utils/logger'
import { loadSummarizationChain } from 'langchain/chains'
import { ChatOpenAI } from '@langchain/openai'
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter'
import { DocumentInterface } from '@langchain/core/documents'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { htmlToMarkdown, parsePreparedContent } from '../utils/parser'
import { AISummary } from '../entity/AISummary'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { getAISummary } from '../services/ai-summaries'
import { YoutubeTranscript, TranscriptResponse } from 'youtube-transcript'
import { Converter } from 'showdown'
import { Video, Client as YouTubeClient } from 'youtubei'

export interface ProcessYouTubeVideoJobData {
  userId: string
  libraryItemId: string
}

export const PROCESS_YOU_TUBE_VIDEO_JOB_NAME = 'process-you-tube-video'

export const processYouTubeVideo = async (
  jobData: ProcessYouTubeVideoJobData
) => {
  try {
    console.log(
      '******************************* processYouTubeVideo *************************'
    )
    const libraryItem = await authTrx(
      async (tx) =>
        tx
          .withRepository(libraryItemRepository)
          .findById(jobData.libraryItemId),
      undefined,
      jobData.userId
    )
    if (!libraryItem || libraryItem.state !== LibraryItemState.Succeeded) {
      logger.info(
        `Not ready to get YouTube metadata job state: ${
          libraryItem?.state ?? 'null'
        }`
      )
      return
    }

    // const doc = await YoutubeLoader.createFromUrl(libraryItem.originalUrl, {
    //   language: 'en',
    //   addVideoInfo: true,
    // }).load()

    // console.log('doc from youtube:', doc)

    const youtube = new YouTubeClient()
    const video = (await youtube.getVideo(
      'Y0fqyJUrwe0' /* libraryItem.originalUrl */
    )) as Video
    console.log('GOT VIDEO: ', video)
    const transcript = await video.getTranscript()

    console.log('description: ', video?.description)
    console.log('chapters: ', video?.chapters)

    // const transcript = await YoutubeTranscript.fetchTranscript(
    //   libraryItem.originalUrl
    // )

    if (transcript) {
      console.log(
        'original transcript:\n',
        transcript.map((item) => item.text).join(' '),
        '\n\n'
      )
    } else {
      console.log('no transcript found')
    }

    //   const prompt = `Given the following transcript data, supplied as a list of text segments, turn it into readable
    //                   text adding punctuation and paragraphs. Format the output as markdown.

    //                   ${JSON.stringify(transcript).replace(/"/g, '\\"')}
    //                   `

    //   const llm = new ChatOpenAI({
    //     configuration: {
    //       apiKey: process.env.OPENAI_API_KEY,
    //     },
    //   })
    //   const response = await llm.generate([[prompt]])
    //   console.log('response: ', response.generations, response.llmOutput)

    //   const text = response.generations[0][0].text
    //   const converter = new Converter()
    //   const transcriptHTML = converter.makeHtml(text)

    //   const html = `<html>
    //   <head><title>1 Billion Rows Challenge</title>
    //   <meta property="og:image" content="https://i.ytimg.com/vi/OO6l1DkYA0k/hqdefault.jpg" />
    //   <meta property="og:image:secure_url" content="https://i.ytimg.com/vi/OO6l1DkYA0k/hqdefault.jpg" />
    //   <meta property="og:title" content="1 Billion Rows Challenge" />
    //   <meta property="og:description" content="" />
    //   <meta property="og:article:author" content="ThePrimeTime" />
    //   <meta property="og:site_name" content="YouTube" />
    //   <meta property="og:type" content="video" />
    //   </head>
    //   <body>
    //   <article>
    //   <p id="_omnivore_youtube_video" class="_omnivore_youtube_video">
    //     <iframe class="_omnivore_youtube_embed" width="619.4690265486726" height="350" src="https://www.youtube.com/embed/OO6l1DkYA0k" title="1 Billion Rows Challenge" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    //   <p>
    //   <a href="https://www.youtube.com/watch?v=OO6l1DkYA0k" target="_blank">1 Billion Rows Challenge</a></p>
    //   <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="https://www.youtube.com/@ThePrimeTimeagen" target="_blank">ThePrimeTime</a></p>
    //   </p>
    //   <div id="_omnivore_youtube_transcript" class="_omnivore_youtube_transcript"></div>
    //   </article>
    //   </body>
    // </html>`.replace(
    //     '<div id="_omnivore_youtube_transcript" class="_omnivore_youtube_transcript"></div>',
    //     `<div id="_omnivore_youtube_transcript" class="_omnivore_youtube_transcript">${transcriptHTML}</div>`
    //   )

    //   console.log('input HTML: ', html)
    //   if (html) {
    //     const preparedDocument = {
    //       document: html,
    //       pageInfo: {},
    //     }
    //     const updatedContent = await parsePreparedContent(
    //       libraryItem.originalUrl,
    //       preparedDocument,
    //       true
    //     )
    //     console.log('updated content: ', updatedContent.parsedContent?.content)
    //     libraryItem.readableContent =
    //       updatedContent.parsedContent?.content ?? libraryItem.readableContent
    //     const _ = await authTrx(
    //       async (t) => {
    //         return t
    //           .getRepository(LibraryItem)
    //           .update(jobData.libraryItemId, libraryItem)
    //       },
    //       undefined,
    //       jobData.userId
    //     )
    //   }
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
