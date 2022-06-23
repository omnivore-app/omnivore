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
    const u = new URL(url);
    return u.hostname.endsWith('medium.com')
  },

  prehandle: async (url, env) => {
    console.log('prehandling medium url', url)

    try {
      const res = new URL(url);
      res.searchParams.delete('source');
      return { url: res.toString() }
    } catch (error) {
      console.error('error prehandling medium url', error)
      throw error
    }
  }
}
