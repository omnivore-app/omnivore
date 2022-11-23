import { PubSubData } from '../index'
import { SearchFilter } from './index'

export class ReadFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    if (!data.readingProgressPercent) {
      return false
    }

    if (this.query === 'read') {
      return data.readingProgressPercent >= 98
    }

    return data.readingProgressPercent < 98
  }
}
