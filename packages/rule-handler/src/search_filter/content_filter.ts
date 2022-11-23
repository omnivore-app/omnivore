import { SearchFilter } from './index'
import { PubSubData } from '../index'

export class ContentFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    console.debug('ContentFilter.isValid', this.filter, data.content)

    if (!data.content) {
      return false
    }

    // TODO: implement content filter with semantic search
    return this.filter === '*' || data.content.includes(this.filter)
  }
}
