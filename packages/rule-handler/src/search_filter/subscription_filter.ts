import { SearchFilter } from './index'
import { PubSubData } from '../index'

export class SubscriptionFilter extends SearchFilter {
  public isValid(data: PubSubData): boolean {
    console.debug('SubscriptionFilter.isValid', this.filter, data.subscription)

    if (!data.subscription) {
      return false
    }

    // compare subscription name case insensitive
    return (
      this.filter === '*' ||
      data.subscription.toLowerCase() === this.filter.toLowerCase()
    )
  }
}
