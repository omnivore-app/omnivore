/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');

const YOUTUBE_URL_MATCH =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

function getYoutubeVideoId(url) {
  const u = new URL(url);
  const videoId = u.searchParams.get('v');
  if (!videoId) {
    const match = url.toString().match(YOUTUBE_URL_MATCH)
    if (match === null || match.length < 6 || !match[5]) {
      return undefined
    }
    return match[5]
  }
  return videoId
}
exports.getYoutubeVideoId = getYoutubeVideoId

exports.youtubeHandler = {
  shouldPrehandle: (url, env) => {
    return YOUTUBE_URL_MATCH.test(url.toString())
  },

  prehandle: async (url, env) => {
    const videoId = getYoutubeVideoId(url)
    if (!videoId) {
      return {}
    }

    const oembedUrl = `https://www.youtube.com/oembed?format=json&url=` + encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)
    const oembed = (await axios.get(oembedUrl.toString())).data;
    const title = oembed.title;
    const ratio = oembed.width / oembed.height;
    const thumbnail = oembed.thumbnail_url;
    const height = 350;
    const width = height * ratio;

    const content = `
    <html>
      <head><title>${title}</title>
      <meta property="og:image" content="${thumbnail}" />
      <meta property="og:image:secure_url" content="${thumbnail}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="" />
      <meta property="og:article:author" content="${oembed.author_name}" />
      </head>
      <body>
      <iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p><a href="${url}" target="_blank">${title}</a></p>
        <p itemscope="" itemprop="author" itemtype="http://schema.org/Person">By <a href="${oembed.author_url}" target="_blank">${oembed.author_name}</a></p>
      </body>
    </html>`

    console.log('got video id', videoId)

    return { content, title: 'Youtube Content' };
  }
}
