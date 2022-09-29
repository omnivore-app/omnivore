import { ContentHandler } from '../index'
import axios from 'axios'

class TDotCoHandler extends ContentHandler {
  shouldResolve(url: string): boolean {
    const T_DOT_CO_URL_MATCH = /^https:\/\/(?:www\.)?t\.co\/.*$/
    return T_DOT_CO_URL_MATCH.test(url)
  }

  async resolve(url: string) {
    return await axios
      .get(url, { maxRedirects: 0, validateStatus: null })
      .then((res) => {
        return new URL(res.headers.location).href
      })
      .catch((err) => {
        console.log('err with t.co url', err)
        return undefined
      })
  }
}
