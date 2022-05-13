/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const os = require('os');

exports.mediumHandler = {

  shouldPrehandle: (url, env) => {
    const MEDIUM_URL_MATCH =
      /https?:\/\/(www\.)?medium.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    const res =  MEDIUM_URL_MATCH.test(url.toString())
    return res
  },

  prehandle: async (url, env) => {
    console.log('prehandling medium url', url)

    try {
      const res = new URL(url);
      res.searchParams.delete('source');
      return { url: res }
    } catch (error) {
      console.error('error prehandling medium url', error)
      throw error
    }
  }
}
