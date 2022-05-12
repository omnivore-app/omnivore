/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const { parseHTML } = require('linkedom');

exports.derstandardHandler = {
  shouldPrehandle: (url, env) => {
    const u = new URL(url);
    return u.hostname === 'www.derstandard.at';
  },

  prehandle: async (url, env) => {
    const response = await axios.get(url, {
      // set cookie to give consent to get the article
      headers: {
        'cookie': `DSGVO_ZUSAGE_V1=true; consentUUID=2bacb9c1-1e80-4be0-9f7b-ee987cf4e7b0_6`
      },
    });
    const content = response.data;

    var title = undefined;
    const dom = new parseHTML(content).document;
    const titleElement = dom.querySelector('.article-title')
    if (!titleElement) {
      title = titleElement.textContent
      titleElement.remove()
    }

    return { content: dom.body.outerHTML, title: title };
  }
}
