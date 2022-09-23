/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const { DateTime } = require('luxon');
const _ = require('underscore');

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_URL_MATCH = /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/

const embeddedTweet = async (url) => {

  const BASE_ENDPOINT = 'https://publish.twitter.com/oembed'

  const apiUrl = new URL(BASE_ENDPOINT)
  apiUrl.searchParams.append('url', url);
  apiUrl.searchParams.append('omit_script', true);
  apiUrl.searchParams.append('dnt', true);

  return await axios.get(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: "follow",
    },
  });
};

const getTweetFields = () => {
  const TWEET_FIELDS =
  "&tweet.fields=attachments,author_id,conversation_id,created_at," +
  "entities,geo,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets," +
  "source,withheld";
  const EXPANSIONS = "&expansions=author_id,attachments.media_keys";
  const USER_FIELDS =
  "&user.fields=created_at,description,entities,location,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified,withheld";
  const MEDIA_FIELDS =
  "&media.fields=duration_ms,height,preview_image_url,url,media_key,public_metrics,width";

  return `${TWEET_FIELDS}${EXPANSIONS}${USER_FIELDS}${MEDIA_FIELDS}`;
}

const getTweetById = async (id) => {
  const BASE_ENDPOINT = "https://api.twitter.com/2/tweets/";
  const apiUrl = new URL(BASE_ENDPOINT + id + '?' + getTweetFields())

  return await axios.get(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: "follow",
    },
  });
};

const getUserByUsername = async (username) => {
  const BASE_ENDPOINT = "https://api.twitter.com/2/users/by/username/";

  const apiUrl = new URL(BASE_ENDPOINT + username)
  apiUrl.searchParams.append('user.fields', 'profile_image_url');

  return await axios.get(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      redirect: "follow",
    },
  });
};

const titleForTweet = (tweet) => {
  return `${tweet.data.author_name} on Twitter`
};

const titleForAuthor = (author) => {
  return `${author.name} on Twitter`
};

const usernameFromStatusUrl = (url) => {
  const match = url.toString().match(TWITTER_URL_MATCH)
  return match[1]
};

const tweetIdFromStatusUrl = (url) => {
  const match = url.toString().match(TWITTER_URL_MATCH)
  return match[2]
};

const formatTimestamp = (timestamp) => {
  return DateTime.fromJSDate(new Date(timestamp)).toLocaleString(DateTime.DATETIME_FULL);
};

exports.twitterHandler = {

  shouldPrehandle: (url, env) => {
    return TWITTER_BEARER_TOKEN && TWITTER_URL_MATCH.test(url.toString())
  },

  // version of the handler that uses the oembed API
  // This isn't great as it doesn't work well with our
  // readability API. But could potentially give a more consistent
  // look to the tweets
  // prehandle: async (url, env) => {
  //   const oeTweet = await embeddedTweet(url)
  //   const dom = new JSDOM(oeTweet.data.html);
  //   const bq = dom.window.document.querySelector('blockquote')
  //   console.log('blockquote:', bq);

  //   const title = titleForTweet(oeTweet)
  //   return { title, content: '<div>' + bq.innerHTML + '</div>', url: oeTweet.data.url };
  // }

  prehandle: async (url, env) => {
    console.log('prehandling twitter url', url)

    const tweetId = tweetIdFromStatusUrl(url)
    const tweetData = (await getTweetById(tweetId)).data;
    const authorId = tweetData.data.author_id;
    const author = tweetData.includes.users.filter(u => u.id = authorId)[0];
    // escape html entities in title
    const title = _.escape(titleForAuthor(author))
    const authorImage = author.profile_image_url.replace('_normal', '_400x400')

    let text = tweetData.data.text;
    if (tweetData.data.entities && tweetData.data.entities.urls) {
      for (let urlObj of tweetData.data.entities.urls) {
        text = text.replace(
          urlObj.url,
          `<a href="${urlObj.expanded_url}">${urlObj.display_url}</a>`
        );
      }
    }

    const front = `
    <div>
      <p>${text}</p>
    `

    var includesHtml =  '';
    if (tweetData.includes.media) {
      includesHtml = tweetData.includes.media.map(m => {
        const linkUrl = m.type == 'photo' ? m.url : url;
        const previewUrl = m.type == 'photo' ? m.url : m.preview_image_url;
        const mediaOpen = `<a class="media-link" href=${linkUrl}>
          <picture>
            <img class="tweet-img" src=${previewUrl} />
          </picture>
          </a>`
        return mediaOpen
      }).join('\n');
   }

   const back = `
       — <a href="https://twitter.com/${author.username}">${author.username}</a> ${author.name} <a href="${url}">${formatTimestamp(tweetData.data.created_at)}</a>
    </div>
    `
    const content = `
    <head>
      <meta property="og:image" content="${authorImage}" />
      <meta property="og:image:secure_url" content="${authorImage}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${_.escape(tweetData.data.text)}" />
    </head>
    <body>
      ${front}
      ${includesHtml}
      ${back}
    </body>`

    return { content, url, title };
  }
}
