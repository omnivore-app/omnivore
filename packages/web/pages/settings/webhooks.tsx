import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useGetWebhooksQuery } from '../../lib/networking/queries/useGetWebhooksQuery'
import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'

export default function Webhooks(): JSX.Element {
  const { webhooks, revalidate } = useGetWebhooksQuery()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  applyStoredTheme(false)

  async function onDelete(id: string): Promise<void> {
    const result = await deleteWebhookMutation(id)
    if (result) {
      showSuccessToast('Deleted', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to delete', { position: 'bottom-right' })
    }
    revalidate()
  }

  const headers = ['URL', 'Event Types', 'Enabled']
  const rows = new Map<string, string[]>()
  webhooks.forEach((webhook) =>
    rows.set(webhook.id, [
      webhook.url,
      webhook.eventTypes.join(', '),
      webhook.enabled ? 'Yes' : 'No',
    ])
  )

  return (
    <PrimaryLayout pageTestId={'webhooks'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {deleteId ? (
        <ConfirmationModal
          message={
            'Future events will no longer be delivered to this webhook. This action cannot be undone.'
          }
          onAccept={async () => {
            await onDelete(deleteId)
            setDeleteId(null)
          }}
          onOpenChange={() => setDeleteId(null)}
        />
      ) : null}
      <Table
        heading={'Webhooks'}
        headers={headers}
        rows={rows}
        onDelete={setDeleteId}
      />
    </PrimaryLayout>
  )
}
