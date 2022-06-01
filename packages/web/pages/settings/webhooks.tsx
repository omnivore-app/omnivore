import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import {
  useGetWebhooksQuery,
  WebhookEvent,
} from '../../lib/networking/queries/useGetWebhooksQuery'
import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'
import { FormInputProps, FormModal } from '../../components/patterns/FormModal'
import { setWebhookMutation } from '../../lib/networking/mutations/setWebhookMutation'

export default function Webhooks(): JSX.Element {
  const { webhooks, revalidate } = useGetWebhooksQuery()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [editModelOpen, setEditModelOpen] = useState(false)
  const [id, setId] = useState<string>('')
  const [url, setUrl] = useState('')
  const [eventTypes, setEventTypes] = useState<WebhookEvent[]>([])

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

  async function onAdd(): Promise<void> {
    const result = await setWebhookMutation('', url, [
      'PAGE_CREATED',
      'HIGHLIGHT_CREATED',
    ])
    if (result) {
      showSuccessToast('Added', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to add', { position: 'bottom-right' })
    }
    setUrl('')
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
  const addFormInputs: FormInputProps[] = [
    {
      label: 'URL',
      onChange: setUrl,
      name: 'url',
      placeholder: 'https://example.com/webhook',
    },
  ]

  return (
    <PrimaryLayout pageTestId={'webhooks'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {addModelOpen && (
        <FormModal
          title={'Add webhook'}
          onSubmit={onAdd}
          onOpenChange={setAddModelOpen}
          inputs={addFormInputs}
          acceptButtonLabel={'Add'}
        />
      )}

      {deleteId && (
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
      )}
      <Table
        heading={'Webhooks'}
        headers={headers}
        rows={rows}
        onDelete={setDeleteId}
        onAdd={() => setAddModelOpen(true)}
      />
    </PrimaryLayout>
  )
}
