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
    try {
      const result = await subscribeMutation({
        url: feedUrl,
        subscriptionType: SubscriptionType.RSS,
      })
      if (result) {
        router.push(`/settings/rss`)
        showSuccessToast('New RSS feed has been added.')
      } else {
        setErrorMessage('There was an error adding new RSS feed.')
      }
    } catch (err) {
      setErrorMessage('Error: ' + err)
    }
  }, [feedUrl, router])

  return (
    <>
      <PageMetaData title="Add new RSS Feed" path="/settings/rss/add" />
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
            <Header>Add new RSS Feed</Header>
          </HStack>

          <FormInput
            type="url"
            key="feedUrl"
            value={feedUrl}
            placeholder={'Enter the RSS feed URL here'}
            onChange={(e) => {
              e.preventDefault()
              setFeedUrl(e.target.value)
            }}
            disabled={false}
            hidden={false}
            required={true}
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
                router.push('/settings/rss')
              }}
            >
              Back
            </Button>
          </HStack>
        </VStack>
      </SettingsLayout>
      <div data-testid="settings-rss-subscribe-page-tag" />
    </>
  )
}
