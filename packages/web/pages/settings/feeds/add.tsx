import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { Button } from '../../../components/elements/Button'
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
})

const FormInput = styled('input', {
  border: '1px solid $textNonessential',
  width: '100%',
  bg: 'transparent',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  borderRadius: '5px',
  textIndent: '8px',
  marginBottom: '2px',
  height: '38px',
  color: '$grayTextContrast',
  '&:focus': {
    border: '1px solid transparent',
    outline: '2px solid $omnivoreCtaYellow',
  },
})

export default function AddRssFeed(): JSX.Element {
  const router = useRouter()
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)
  const [feedUrl, setFeedUrl] = useState<string>('')

  const subscribe = useCallback(async () => {
    if (!feedUrl) {
      setErrorMessage('Please enter a valid feed URL')
      return
    }

    let normailizedUrl: string
    // normalize the url
    try {
      normailizedUrl = new URL(feedUrl.trim()).toString()
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
          alignment={'center'}
          css={{
            margin: '0 auto',
            width: '80%',
            padding: '24px',
            maxWidth: '865px',
            height: '100%',
            gap: '20px',
          }}
        >
          <HStack
            alignment={'start'}
            distribution={'start'}
            css={{
              width: '100%',
            }}
          >
            <Header>Add new Feed</Header>
          </HStack>

          <FormInput
            type="url"
            key="feedUrl"
            tabIndex={1}
            autoFocus={true}
            value={feedUrl}
            placeholder={'Enter the feed URL here'}
            onChange={(e) => {
              setErrorMessage(undefined)
              setFeedUrl(e.target.value)
            }}
          />
          {errorMessage && (
            <StyledText style="error">{errorMessage}</StyledText>
          )}
          <HStack
            css={{ width: '100%', gap: '10px' }}
            alignment="center"
            distribution="end"
          >
            <Button
              style="cancelGeneric"
              css={{}}
              onClick={async () => {
                router.push('/settings/feeds')
              }}
            >
              Back
            </Button>
            <Button
              tabIndex={1}
              style="ctaDarkYellow"
              css={{ marginRight: '10px' }}
              onClick={subscribe}
            >
              Add
            </Button>
          </HStack>
        </VStack>
      </SettingsLayout>
      <div data-testid="settings-feeds-subscribe-page-tag" />
    </>
  )
}
