import { ContentHandler, PreHandleResult } from '../content-handler'
import axios from 'axios'
import _ from 'underscore'
import YoutubeTranscript, { TranscriptResponse } from 'youtube-transcript'
import * as ytdl from 'ytdl-core'

const YOUTUBE_URL_MATCH =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

export const getYoutubeVideoId = (url: string) => {
  const u = new URL(url)
  const videoId = u.searchParams.get('v')
  if (!videoId) {
    const match = url.toString().match(YOUTUBE_URL_MATCH)
    if (match === null || match.length < 6 || !match[5]) {
      return undefined
    }
    return match[5]
  }
  return videoId
}

type VideoInfo = {
  videoId: string
  chapters: ytdl.Chapter[]
  defaultLanguage: string
}

const getYouTubeVideoInfo = async (
  url: string
): Promise<VideoInfo | undefined> => {
  const info = await ytdl.getInfo(url)
  console.log(JSON.stringify(info))
  if (!info.videoDetails.videoId) {
    return undefined
  }

  info.videoDetails.chapters.map((chapter) => {
    console.log('chapter: ' + JSON.stringify(chapter))
  })

  var defaultLanguage: string | undefined = undefined
  const defaultIndex =
    info.player_response.captions?.playerCaptionsTracklistRenderer
      .defaultAudioTrackIndex
  if (
    typeof defaultIndex == 'number' &&
    (info.player_response.captions?.playerCaptionsTracklistRenderer
      .captionTracks.length ?? 0) < defaultIndex
  ) {
    const captions =
      info.player_response.captions?.playerCaptionsTracklistRenderer
        .captionTracks[defaultIndex]
    if (captions?.languageCode) {
      defaultLanguage = captions.languageCode
    }
  }

  return {
    videoId: info.videoDetails.videoId,
    chapters: info.videoDetails.chapters,
    defaultLanguage: defaultLanguage ?? 'en',
  }
}

type TranscriptChapter = {
  title: string | undefined
  start: number
  end: number
  phrases: string[]
}

const groupTranscriptByChapters = (
  chapters: ytdl.Chapter[],
  transcript: TranscriptResponse[]
): string => {
  var tchapters: TranscriptChapter[] = chapters.map(
    (chapter, idx, chapters) => {
      if (idx < chapters.length - 1) {
        return {
          title: chapter.title,
          start: chapter.start_time,
          end: chapters[idx + 1].start_time,
          phrases: [],
        }
      }
      return {
        title: chapter.title,
        start: chapter.start_time,
        end: Number.MAX_SAFE_INTEGER,
        phrases: [],
      }
    }
  )
  if (tchapters.length < 1) {
    tchapters = [
      {
        title: undefined,
        start: 0,
        end: Number.MAX_SAFE_INTEGER,
        phrases: [],
      },
    ]
  }

  console.log('T CHAPTERS: ', tchapters)
  for (var phrase of transcript) {
    const chapter = tchapters.find((ch) => {
      var pStart = phrase.offset / 1000
      var pEnd = (phrase.offset + phrase.duration) / 1000
      return pStart >= ch.start && pEnd <= ch.end
    })
    if (chapter) {
      chapter.phrases.push(phrase.text)
    } else {
      console.log('no chapter for', phrase.offset, phrase.duration, phrase.text)
    }
  }

  var text = `<div class='_omnivore-video-transcript'>`
  for (var tchapter of tchapters) {
    console.log(tchapter.title)
    text += `<h3 class='_omnivore-video-transcript-chapter'>${tchapter.title}</h3>`
    tchapter.phrases.forEach((ph) => {
      console.log(' - ', ph)
      text += `<div class='_omnivore-video-transcript-phrase'><a href=''>00:00</a>${ph} </div>`
    })
  }
  text += `</div>`
  console.log('<html><body>' + text + '</body></html>')

  return text
}

export class YoutubeHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 'Youtube'
  }

  shouldPreHandle(url: string): boolean {
    return YOUTUBE_URL_MATCH.test(url.toString())
  }

  async preHandle(url: string): Promise<PreHandleResult> {
    const videoId = getYoutubeVideoId(url)
    const videoInfo = await getYouTubeVideoInfo(url)

    if (!videoId || !videoInfo) {
      console.log('error getting video info')
      return {}
    }

    const oembedUrl =
      `https://www.youtube.com/oembed?format=json&url=` +
      encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)
    const oembed = (await axios.get(oembedUrl.toString())).data as {
      title: string
      width: number
      height: number
      thumbnail_url: string
      author_name: string
      author_url: string
    }
    // escape html entities in title
    const title = _.escape(oembed.title)
    const ratio = oembed.width / oembed.height
    const thumbnail = oembed.thumbnail_url
    const height = 350
    const width = height * ratio
    const authorName = _.escape(oembed.author_name)

    let transcript = ''
    try {
      const response = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: videoInfo.defaultLanguage,
      })

      transcript = groupTranscriptByChapters(videoInfo.chapters, response)
      //      transcript = response.map((item) => item.text).join(' ')
      console.debug('transcript: ', transcript)
    } catch (e) {
      console.log('error getting transcript', e)
    }

    const content = `
    <html>
      <head><title>${title}</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="" />
      <meta property="og:article:author" content="${authorName}" />
      <meta property="omnivore:page-type" content="youtube" />
      </head>
      <body>
      <iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p><a href="${url}" target="_blank">${title}</a></p>
        <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${authorName}</a></p>
        <p class='_omnivore-video-transcript'>
          ${transcript}
        </p>
      </body>
    </html>`

    return { content, title: 'Youtube Content' }
  }
}
