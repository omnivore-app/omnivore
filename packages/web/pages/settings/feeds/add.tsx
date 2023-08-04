import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { Button } from '../../../components/elements/Button'
import { FormInput } from '../../../components/elements/FormElements'
import {
  Box,
  HStack,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { StyledText } from '../../../components/elements/StyledText'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'
import { subscribeMutation } from '../../../lib/networking/mutations/subscribeMutation'
import { SubscriptionType } from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { showSuccessToast } from '../../../lib/toastHelpers'
import { formatMessage } from '../../../locales/en/messages'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
})

export default function AddRssFeed(): JSX.Element {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [feedUrl, setFeedUrl] = useState<string>('')

  const subscribe = useCallback(async () => {
    if (!feedUrl) {
      setErrorMessage('Please enter a valid feed URL')
      return
    }

    let normailizedUrl: string
    // normalize the url
    try {
      normailizedUrl = new URL(feedUrl).toString()
    } catch (e) {
      setErrorMessage('Please enter a valid feed URL')
      return
    }

    const result = await subscribeMutation({
      url: normailizedUrl,
      subscriptionType: SubscriptionType.RSS,
    })

    if (result.subscribe.errorCodes) {
      const errorMessage = formatMessage({
        id: `error.${result.subscribe.errorCodes[0]}`,
      })
      setErrorMessage(`There was an error adding new feed: ${errorMessage}`)
      return
    }

    router.push(`/settings/feeds`)
    showSuccessToast('New feed has been added.')
  }, [feedUrl, router])

  return (
    <>
      <PageMetaData title="Add new Feed" path="/settings/feeds/add" />
      <SettingsLayout>
        <VStack
          distribution={'start'}
          alignment={'start'}
          css={{
            margin: '0 auto',
            width: '80%',
            height: '100%',
          }}
        >
          <HStack
            alignment={'start'}
            distribution={'start'}
            css={{
              width: '80%',
              pb: '$2',
              borderBottom: '1px solid $utilityTextDefault',
              pr: '$1',
            }}
          >
            <Header>Add new Feed</Header>
          </HStack>

          <FormInput
            type="url"
            key="feedUrl"
            value={feedUrl}
            placeholder={'Enter the feed URL here'}
            onChange={(e) => {
              setErrorMessage(undefined)
              setFeedUrl(e.target.value)
            }}
            css={{
              border: '1px solid $textNonessential',
              borderRadius: '8px',
              width: '80%',
              bg: 'transparent',
              fontSize: '16px',
              textIndent: '8px',
              my: '20px',
              height: '38px',
              color: '$grayTextContrast',
              '&:focus': {
                outline: 'none',
                boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
              },
            }}
          />
          {errorMessage && (
            <StyledText style="error">{errorMessage}</StyledText>
          )}
          <HStack>
            <Button
              style="ctaDarkYellow"
              css={{ marginRight: '10px' }}
              onClick={subscribe}
            >
              Add
            </Button>
            <Button
              style="ctaGray"
              css={{}}
              onClick={async () => {
                router.push('/settings/feeds')
              }}
            >
              Back
            </Button>
          </HStack>
        </VStack>
      </SettingsLayout>
      <div data-testid="settings-feeds-subscribe-page-tag" />
    </>
  )
}
