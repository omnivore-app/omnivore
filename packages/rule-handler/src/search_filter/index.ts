import { PubSubData } from '../index'

export abstract class SearchFilter {
  constructor(protected query: string) {
    this.query = query
  }

  public abstract isValid(data: PubSubData): boolean
}
