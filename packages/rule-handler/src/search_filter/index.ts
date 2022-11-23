import { PubSubData } from '../index'

export abstract class SearchFilter {
  constructor(protected filter: string) {
    this.filter = filter
  }

  public abstract isValid(data: PubSubData): boolean
}
