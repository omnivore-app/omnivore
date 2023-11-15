import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/elements/Button'
import { HStack, VStack } from '../../components/elements/LayoutPrimitives'
import {
  StyledText,
  StyledTextSpan,
} from '../../components/elements/StyledText'
import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { joinGroupMutation } from '../../lib/networking/mutations/joinGroupMutation'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { showSuccessToast } from '../../lib/toastHelpers'

export default function InvitePage(): JSX.Element {
  const router = useRouter()
  const { viewerData, viewerDataError, isLoading } = useGetViewerQuery()
  const { inviteCode } = router.query
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)

  // Check if the user is logged in and display an error message if they are not
  useEffect(() => {
    if (!isLoading && router.isReady) {
      if (viewerDataError || !viewerData?.me) {
        setErrorMessage(
          'You are not logged in. You must log in or signup before accepting your invite.'
        )
      }
    }
  }, [isLoading, router, viewerData, viewerDataError])

  const acceptClicked = useCallback(
    (event: any) => {
      event?.stopPropagation()

      if (!router.isReady) {
        return
      }
      if (!inviteCode || typeof inviteCode != 'string') {
        setErrorMessage('No invite code provided')
      }

      const joinGroup = async () => {
        try {
          const result = await joinGroupMutation(inviteCode as string)
          if (!result) {
            throw 'Unknown error occurred.'
          }
          showSuccessToast(`You have been added to the ${result.name} group`)
          router.push(`/home`)
        } catch (error) {
          console.log('error', error)
          setErrorMessage('Unable to join group')
        }
      }

      joinGroup().catch((error) => {
        setErrorMessage(error)
      })
    },
    [router, inviteCode]
  )

  return <>
    <PageMetaData title="Accept Invite - Omnivore" path="/invite" />
    <ProfileLayout>
      <VStack
        alignment="center"
        css={{
          padding: '16px',
          background: 'white',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          border: '1px solid #3D3D3D',
          boxShadow: '#B1B1B1 9px 9px 9px -9px',
        }}
      >
        <StyledText style="subHeadline" css={{ color: '$omnivoreGray' }}>
          You&apos;re invited
        </StyledText>

        <StyledText
          style="action"
          css={{
            mt: '0px',
            pt: '4px',
            width: '100%',
            color: '$omnivoreLightGray',
            textAlign: 'center',
            whiteSpace: 'normal',
          }}
        >
          You have been invited to join a recommendation group on Omnivore.
          Recommendation groups allow you to share articles with other group
          members.
        </StyledText>
        {errorMessage && (
          <StyledText
            style="error"
            css={{
              mt: '0px',
              pt: '4px',
              width: '100%',
              textAlign: 'center',
              whiteSpace: 'normal',
            }}
          >
            {errorMessage}
          </StyledText>
        )}

        <HStack
          alignment="center"
          distribution="center"
          css={{
            gap: '10px',
            width: '100%',
            height: '80px',
          }}
        >
          {viewerData?.me ? (
            <Button
              type="submit"
              style={'ctaDarkYellow'}
              onClick={acceptClicked}
            >
              Accept Invite
            </Button>
          ) : (
            <Button
              type="submit"
              style={'ctaDarkYellow'}
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          )}
        </HStack>
        <StyledText
          style="action"
          css={{
            m: '0px',
            pt: '16px',
            width: '100%',
            color: '$omnivoreLightGray',
            textAlign: 'center',
            whiteSpace: 'normal',
          }}
        >
          Don&apos;t have an Omnivore account?{' '}
          <Link href="/login" passHref legacyBehavior>
            <StyledTextSpan
              style="actionLink"
              css={{ color: '$omnivoreGray' }}
            >
              Signup
            </StyledTextSpan>
          </Link>
        </StyledText>
      </VStack>
      <div data-testid="invite-page-tag" />
    </ProfileLayout>
  </>;
}
