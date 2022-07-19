/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const Url = require('url');


exports.tDotCoHandler = {

  shouldResolve: function (url, env) {
    const T_DOT_CO_URL_MATCH = /^https:\/\/(?:www\.)?t\.co\/.*$/;
    return T_DOT_CO_URL_MATCH.test(url);
  },

  resolve: async function(url, env) {
    return await axios.get(url, { maxRedirects: 0, validateStatus: null })
      .then(res => {
        return Url.parse(res.headers.location).href;
      }).catch((err) => {
        console.log('err with t.co url', err);
        return undefined;
      });
  },

  shouldPrehandle: (url, env) => {
    return false
  },
}
