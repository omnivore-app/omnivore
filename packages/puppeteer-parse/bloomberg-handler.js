/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const os = require('os');
const { parseHTML } = require('linkedom');

exports.bloombergHandler = {

  shouldPrehandle: (url, env) => {
    const BLOOMBERG_URL_MATCH =
      /https?:\/\/(www\.)?bloomberg.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    return BLOOMBERG_URL_MATCH.test(url.toString())
  },

  prehandle: async (url, env) => {
    console.log('prehandling bloomberg url', url)

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
      return { title: dom.title, content: dom.querySelector('body').innerHTML, url: url }
    } catch (error) {
      console.error('error prehandling bloomberg url', error)
      throw error
    }
  }
}
