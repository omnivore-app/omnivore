import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'

import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { PrimaryLayout } from '../../components/templates/PrimaryLayout'

import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { Button } from '../../components/elements/Button'
import { HStack } from '../../components/elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { Loader } from '../../components/templates/SavingRequest'
import { deleteAccountMutation } from '../../lib/networking/mutations/deleteAccountMutation'

export default function DeleteMyAccount(): JSX.Element {
  const router = useRouter()
  const viewer = useGetViewerQuery()
  const [showConfirm, setShowConfirm] = useState(false)

  applyStoredTheme(false)

  async function deleteAccount(): Promise<void> {
    const viewerId = viewer.viewerData?.me?.id
    if (!viewerId) {
      showErrorToast("Error deleting user, no user id found.")
      return
    }

    const result = await deleteAccountMutation(viewerId)
    if (result) {
      showSuccessToast('Account deleted',)
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
    <PrimaryLayout pageTestId={'api-keys'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {showConfirm ? (
        <ConfirmationModal
          message={'Are you sure you want to delete your account? This can not be reversed and all your data (saved articles, highlights, and notes) will be deleted.'}
          onAccept={deleteAccount}
          onOpenChange={() => setShowConfirm(false)}
        />
      ) : null}

      <HStack css={{ padding: '24px', width: '100%', height: '100%'}}>
        {viewer && router ? (
          <Button
            style="ctaDarkYellow"
            onClick={() => setShowConfirm(true)}
          >
            Delete my Account
          </Button>
        ) : <Loader />}
      </HStack>
    </PrimaryLayout>
  )
}
