import { useState } from 'react'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { useGetSubscriptionsQuery } from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { unsubscribeMutation } from '../../lib/networking/mutations/unsubscribeMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Table } from '../../components/elements/Table'

export default function SubscriptionsPage(): JSX.Element {
  const { subscriptions, revalidate } = useGetSubscriptionsQuery()
  const [confirmUnsubscribeName, setConfirmUnsubscribeName] = useState<
    string | null
  >(null)

  applyStoredTheme(false)

  async function onUnsubscribe(name: string): Promise<void> {
    const result = await unsubscribeMutation(name)
    if (result) {
      showSuccessToast('Unsubscribed', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to unsubscribe', { position: 'bottom-right' })
    }
    revalidate()
  }

  const headers = ['Name', 'Email', 'Updated Time']
  const rows = subscriptions.map((subscription) => [
    subscription.name,
    subscription.newsletterEmail,
    subscription.updatedAt.toString(),
  ])

  return (
    <PrimaryLayout pageTestId="settings-subscriptions-tag">
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {confirmUnsubscribeName ? (
        <ConfirmationModal
          message={
            'Are you sure? You will stop receiving newsletters from this subscription.'
          }
          onAccept={async () => {
            await onUnsubscribe(confirmUnsubscribeName)
            setConfirmUnsubscribeName(null)
          }}
          onOpenChange={() => setConfirmUnsubscribeName(null)}
        />
      ) : null}
      <Table
        heading={'Subscriptions'}
        headers={headers}
        rows={rows}
        onDelete={setConfirmUnsubscribeName}
      />

      {/* TODO: Dynamically loaded from API response */}
      <Table
        heading={'Popular Newsletters'}
        headers={['Substack', 'Axios', 'Bloomberg']}
        rows={[
          [
            'https://substack.com/',
            'https://www.axios.com/newsletters',
            'https://www.bloomberg.com/account/newsletters',
          ],
        ]}
      />
    </PrimaryLayout>
  )
}
