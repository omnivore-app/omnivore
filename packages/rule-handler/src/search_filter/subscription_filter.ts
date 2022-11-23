import { SearchFilter } from './index'
import { PubSubData } from '../index'

export class SubscriptionFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    if (!data.subscription) {
      return false
    }

    // compare subscription name case insensitive
    return (
      this.query === '*' ||
      data.subscription.toLowerCase() === this.query.toLowerCase()
    )
  }
}
