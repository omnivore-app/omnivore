import { Subscription } from '../entity/subscription'
import { getRepository } from '../entity/utils'
import { SubscriptionStatus } from '../generated/graphql'
import { sendEmail } from '../utils/sendEmail'
import axios from 'axios'
import { NewsletterEmail } from '../entity/newsletter_email'
import { createNewsletterEmail } from './newsletters'

const sendUnsubscribeEmail = async (
  unsubscribeMailTo: string,
  newsletterEmail: string
): Promise<void> => {
  const sent = await sendEmail({
    to: unsubscribeMailTo,
    subject: 'Unsubscribe',
    text: `This message was automatically generated by Omnivore.`,
    from: newsletterEmail,
  })

  if (!sent) {
    throw new Error(`Failed to unsubscribe, email: ${unsubscribeMailTo}`)
  }
}

const sendUnsubscribeHttpRequest = async (url: string): Promise<void> => {
  const response = await axios.get(url)

  if (response.status !== 200) {
    throw new Error(`Failed to unsubscribe, response: ${response.statusText}`)
  }
}

export const saveSubscription = async (
  userId: string,
  name: string,
  newsletterEmail: string,
  unsubscribeMailTo?: string,
  unsubscribeHttpUrl?: string
): Promise<Subscription> => {
  const subscription = await getRepository(Subscription).findOneBy({
    name,
    user: { id: userId },
  })

  if (subscription) {
    // if subscription already exists, updates updatedAt
    subscription.status = SubscriptionStatus.Active
    subscription.newsletterEmail = newsletterEmail
    unsubscribeMailTo && (subscription.unsubscribeMailTo = unsubscribeMailTo)
    unsubscribeHttpUrl && (subscription.unsubscribeHttpUrl = unsubscribeHttpUrl)
    return getRepository(Subscription).save(subscription)
  }

  // create new subscription
  return getRepository(Subscription).save({
    name,
    newsletterEmail,
    user: { id: userId },
    status: SubscriptionStatus.Active,
    unsubscribeHttpUrl,
    unsubscribeMailTo,
  })
}

export const unsubscribe = async (
  subscription: Subscription
): Promise<Subscription> => {
  if (subscription.unsubscribeMailTo) {
    // unsubscribe by sending email first
    await sendUnsubscribeEmail(
      subscription.unsubscribeMailTo,
      subscription.newsletterEmail
    )
  } else if (subscription.unsubscribeHttpUrl) {
    // unsubscribe by sending http request if no unsubscribeMailTo
    await sendUnsubscribeHttpRequest(subscription.unsubscribeHttpUrl)
  } else {
    throw new Error('No unsubscribe method defined')
  }

  // set status to unsubscribed
  subscription.status = SubscriptionStatus.Unsubscribed
  return getRepository(Subscription).save(subscription)
}

export const unsubscribeAll = async (
  userId: string,
  newsletterEmail: string
): Promise<void> => {
  try {
    const subscriptions = await getRepository(Subscription).find({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.Active,
        newsletterEmail,
      },
    })

    for (const subscription of subscriptions) {
      try {
        await unsubscribe(subscription)
      } catch (error) {
        console.log('Failed to unsubscribe', error)
      }
    }
  } catch (error) {
    console.log('Failed to unsubscribe all', error)
  }
}

export const getSubscribeHandler = (name: string): SubscribeHandler | null => {
  switch (name.toLowerCase()) {
    case 'axios_essentials':
      return new AxiosEssentialsHandler()
    case 'morning_brew':
      return new MorningBrewHandler()
    case 'milk_road':
      return new MilkRoadHandler()
    case 'money_stuff':
      return new MoneyStuffHandler()
    default:
      return null
  }
}

export class SubscribeHandler {
  async handleSubscribe(
    userId: string,
    name: string
  ): Promise<Subscription[] | null> {
    try {
      const newsletterEmail =
        (await getRepository(NewsletterEmail).findOneBy({
          user: { id: userId },
        })) || (await createNewsletterEmail(userId))

      // subscribe to newsletter service
      const subscribedNames = await this._subscribe(newsletterEmail.address)
      if (subscribedNames.length === 0) {
        console.log('Failed to get subscribe response', name)
        return null
      }

      // create new subscriptions in db
      const newSubscriptions = subscribedNames.map(
        (name: string): Promise<Subscription> => {
          return getRepository(Subscription).save({
            name,
            newsletterEmail: newsletterEmail.address,
            user: { id: userId },
            status: SubscriptionStatus.Active,
          })
        }
      )

      return Promise.all(newSubscriptions)
    } catch (error) {
      console.log('Failed to handleSubscribe', error)
      return null
    }
  }

  async _subscribe(email: string): Promise<string[]> {
    return Promise.all([])
  }
}

class AxiosEssentialsHandler extends SubscribeHandler {
  async _subscribe(email: string): Promise<string[]> {
    await axios.post('https://api.axios.com/api/render/readers/unauth-sub/', {
      headers: {
        'content-type': 'application/json',
      },
      body: `{"lists":["newsletter_axiosam","newsletter_axiospm","newsletter_axiosfinishline"],"user_vars":{"source":"axios","medium":null,"campaign":null,"term":null,"content":null,"page":"webflow-newsletters-all"},"email":"${email}"`,
    })

    return ['Axios AM', 'Axios PM', 'Axios Finish Line']
  }
}

class MorningBrewHandler extends SubscribeHandler {
  async _subscribe(email: string): Promise<string[]> {
    await axios.post('https://singularity.morningbrew.com/graphql', {
      headers: {
        'content-type': 'application/json',
      },
      body: `{"operationName":"CreateUserSubscription","variables":{"signupCreateInput":{"email":"${email}","kid":null,"gclid":null,"utmCampaign":"mb","utmMedium":"website","utmSource":"hero-module","utmContent":null,"utmTerm":null,"requestPath":"https://www.morningbrew.com/daily","uiModule":"hero-module"},"signupCreateVerticalSlug":"daily"},"query":"mutation CreateUserSubscription($signupCreateInput: SignupCreateInput!, $signupCreateVerticalSlug: String!) {\\n  signupCreate(input: $signupCreateInput, verticalSlug: $signupCreateVerticalSlug) {\\n    user {\\n      accessToken\\n      email\\n      hasSeenOnboarding\\n      referralCode\\n      verticalSubscriptions {\\n        isActive\\n        vertical {\\n          slug\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    isNewSubscription\\n    fromAffiliate\\n    subscriptionId\\n    __typename\\n  }\\n}\\n"}`,
    })

    return ['Morning Brew']
  }
}

class MilkRoadHandler extends SubscribeHandler {
  async _subscribe(email: string): Promise<string[]> {
    await axios.post('https://www.milkroad.com/subscriptions', {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&commit=Subscribe`,
    })

    return ['Milk Road']
  }
}

class MoneyStuffHandler extends SubscribeHandler {
  async _subscribe(email: string): Promise<string[]> {
    await axios.put(
      `https://login.bloomberg.com/api/newsletters/update?email=${encodeURIComponent(
        email
      )}&source=&notify=true&optIn=false`,
      {
        headers: {
          'content-type': 'application/json',
        },
        body: '{"Money Stuff":true}',
      }
    )

    return ['Money Stuff']
  }
}
