import { SearchFilter } from './index'
import { PubSubData } from '../index'

export class TypeFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    if (!data.pageType) {
      return false
    }

    return this.query === '*' || data.pageType === this.query
  }
}
