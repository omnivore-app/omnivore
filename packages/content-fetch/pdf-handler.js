/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const Url = require('url');


exports.pdfHandler = {

  shouldPrehandle: (url, env) => {
    const u = Url.parse(url)
    const path = u.path.replace(u.search, '')
    return path.endsWith('.pdf')
  },

  prehandle: async (url, env) => {
    return { contentType: 'application/pdf' };
  }
}
