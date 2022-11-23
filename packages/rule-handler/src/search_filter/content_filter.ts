import { SearchFilter } from './index'
import { PubSubData } from '../index'

export class ContentFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    if (!data.content) {
      return false
    }

    // TODO: implement content filter with semantic search
    return this.query === '*' || data.content.includes(this.query)
  }
}
