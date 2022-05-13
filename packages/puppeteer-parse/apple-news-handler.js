/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const Url = require('url');
const axios = require('axios');
const { promisify } = require('util');
const { DateTime } = require('luxon');
const os = require('os');
const { Cipher } = require('crypto');
const { parseHTML } = require('linkedom');

exports.appleNewsHandler = {

  shouldPrehandle: (url, env) => {
    const u = new URL(url);
    if (u.hostname === 'apple.news') {
      return true;
    }
    return false
  },

  prehandle: async (url, env) => {
    const MOBILE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
    const response = await axios.get(url, { headers: { 'User-Agent': MOBILE_USER_AGENT }  } );
    const data = response.data;

    const dom = parseHTML(data).document;

    // make sure its a valid URL by wrapping in new URL
    const u = new URL(dom.querySelector('span.click-here').parentNode.href);
    return { url: u.href };
  }
}
