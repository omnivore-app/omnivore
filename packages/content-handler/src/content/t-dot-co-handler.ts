import { ContentHandler } from '../content-handler'
import axios from 'axios'

export class TDotCoHandler extends ContentHandler {
  constructor() {
    super()
    this.name = 't.co'
  }

  shouldResolve(url: string): boolean {
    const T_DOT_CO_URL_MATCH = /^https:\/\/(?:www\.)?t\.co\/.*$/
    return T_DOT_CO_URL_MATCH.test(url)
  }

  async resolve(url: string) {
    return axios
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
