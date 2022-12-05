import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { joinGroupMutation } from '../../lib/networking/mutations/joinGroupMutation'
import { showSuccessToast } from '../../lib/toastHelpers'

export default function InvitePage(): JSX.Element {
  const router = useRouter()
  const { inviteCode } = router.query

  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) {
      return
    }
    if (!inviteCode || typeof inviteCode != 'string') {
      setError('No invite code provided')
    }

    const joinGroup = async () => {
      try {
        const result = await joinGroupMutation(inviteCode as string)
        if (!result) {
          throw 'Unknown error occurred.'
        }
        showSuccessToast(`You have been added to the ${result.name} group`)
      } catch (error) {
        setError('Unable to join group')
      }
    }

    joinGroup().catch((error) => {
      setError(error)
    })
  }, [router, inviteCode])
  return (
    <>
      <PageMetaData title="Accept Invite - Omnivore" path="/invite" />
      <ProfileLayout>Accepting invite to join</ProfileLayout>
      <div data-testid="invite-page-tag" />
    </>
  )
}
