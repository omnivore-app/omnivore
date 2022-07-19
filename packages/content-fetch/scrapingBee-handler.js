/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const { parseHTML } = require('linkedom');

const os = require('os');

exports.scrapingBeeHandler = {

  shouldPrehandle: (url, env) => {
    const u = new URL(url);
    const hostnames = [
      'nytimes.com',
      'news.google.com',
    ]

    return hostnames.some((h) => u.hostname.endsWith(h))
  },

  prehandle: async (url, env) => {
    console.log('prehandling url with scrapingbee', url)

    try {
      const response = await axios.get('https://app.scrapingbee.com/api/v1', {
        params: {
          'api_key': process.env.SCRAPINGBEE_API_KEY,
          'url': url,
          'return_page_source': true,
          'block_ads': true,
          'block_resources': false,
        }
      })
      const dom = parseHTML(response.data).document;
      return { title: dom.title, content: response.data, url: url }
    } catch (error) {
      console.error('error prehandling url w/scrapingbee', error)
      throw error
    }
  }
}
