import { useState } from 'react'
import { useRouter } from 'next/router'

import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { SettingsLayout } from '../../components/templates/SettingsLayout'

import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { Button } from '../../components/elements/Button'
import { VStack } from '../../components/elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { Loader } from '../../components/templates/SavingRequest'
import { deleteAccountMutation } from '../../lib/networking/mutations/deleteAccountMutation'
import Link from 'next/link'

export default function DeleteMyAccount(): JSX.Element {
  const router = useRouter()
  const viewer = useGetViewerQuery()
  const [showConfirm, setShowConfirm] = useState(false)

  applyStoredTheme()

  async function deleteAccount(): Promise<void> {
    const viewerId = viewer.viewerData?.me?.id
    if (!viewerId) {
      showErrorToast('Error deleting user, no user id found.')
      return
    }

    const result = await deleteAccountMutation(viewerId)
    if (result) {
      showSuccessToast('Account deleted')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } else {
      showErrorToast('Failed to delete')
    }

    setShowConfirm(false)
  }

  if (!viewer || !router) {
    return <Loader />
  }

  return (
    <SettingsLayout>
      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            gap: '25px',
            minWidth: '300px',
            maxWidth: '865px',
          }}
        >
          {showConfirm ? (
            <ConfirmationModal
              message={
                'Are you sure you want to delete your account? This can not be reversed and all your data (saved articles, highlights, and notes) will be deleted.'
              }
              onAccept={deleteAccount}
              onOpenChange={() => setShowConfirm(false)}
            />
          ) : null}

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '20px',
              borderRadius: '5px',
            }}
            distribution="start"
            alignment="start"
          >
            <p>
              Deleting your account will delete all your saved items, notes, and
              highlights. This operation can not be undone. Note that once your
              account is deleted you will not be able to create a new account
              with the same username/email for at least 24hrs.
            </p>
            <p>
              If you are deleting your account because you&apos;ve imported too
              many items, and want a &quot;fresh start&quot; you can try using
              the <Link href="/tools/bulk">bulk tool</Link> to clean up your
              account instead.
            </p>
            {viewer && router ? (
              <Button
                style="ctaDarkYellow"
                onClick={() => setShowConfirm(true)}
                css={{ alignSelf: 'center' }}
              >
                Delete my Account
              </Button>
            ) : (
              <Loader />
            )}
          </VStack>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}
