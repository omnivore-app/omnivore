import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import {
  useGetWebhooksQuery,
  WebhookEvent,
} from '../../lib/networking/queries/useGetWebhooksQuery'
import { useEffect, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'
import { FormInputProps, FormModal } from '../../components/patterns/FormModal'
import { setWebhookMutation } from '../../lib/networking/mutations/setWebhookMutation'

interface Webhook {
  id?: string
  url: string
  eventTypes: string
  contentType?: string
  method?: string
  enabled: string
  createdAt?: Date
  updatedAt?: Date
}

export default function Webhooks(): JSX.Element {
  const { webhooks, revalidate } = useGetWebhooksQuery()
  const [onDeleteId, setOnDeleteId] = useState<string | null>(null)
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [onEditWebhook, setOnEditWebhook] = useState<Webhook | null>(null)
  const [url, setUrl] = useState('')
  const [eventTypes, setEventTypes] = useState<WebhookEvent[]>([
    'PAGE_CREATED',
    'HIGHLIGHT_CREATED',
  ])
  const [enabled, setEnabled] = useState(false)
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([
    {
      label: 'URL',
      onChange: setUrl,
      name: 'url',
      placeholder: 'https://example.com/webhook',
      required: true,
    },
    {
      label: 'Event Types',
      name: 'eventTypes',
      disabled: true,
      value: eventTypes.join(', '),
    },
    {
      label: 'Enabled',
      name: 'enabled',
      type: 'checkbox',
      onChange: setEnabled,
    },
  ])
  const { webhook } = useGetWebhookQuery(onEditId)

  useEffect(() => {
    if (webhook) {
      setFormInputs([
        {
          label: 'URL',
          onChange: setUrl,
          name: 'url',
          value: webhook.url,
        },
        {
          label: 'Event Types',
          name: 'eventTypes',
          disabled: true,
          value: webhook.eventTypes.join(', '),
        },
        {
          label: 'Enabled',
          name: 'enabled',
          type: 'checkbox',
          onChange: setEnabled,
          value: webhook.enabled,
        },
      ])
    }
  }, [webhook])

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
    const result = await setWebhookMutation({ url, eventTypes, enabled })
    if (result) {
      showSuccessToast('Added', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to add', { position: 'bottom-right' })
    }
    setUrl('')
    revalidate()
  }

  async function onUpdate(): Promise<void> {
    const result = await setWebhookMutation({
      id: onEditWebhook?.id,
      url,
      eventTypes,
      enabled: enabled,
    })
    if (result) {
      showSuccessToast('Updated', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to update', { position: 'bottom-right' })
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
          inputs={formInputs}
          acceptButtonLabel={'Add'}
        />
      )}

      {onEditWebhook && (
        <FormModal
          title={'Edit webhook'}
          onSubmit={onUpdate}
          onOpenChange={() => setOnEditWebhook(null)}
          inputs={formInputs}
          acceptButtonLabel={'Update'}
        />
      )}

      {onDeleteId && (
        <ConfirmationModal
          message={
            'Future events will no longer be delivered to this webhook. This action cannot be undone.'
          }
          onAccept={async () => {
            await onDelete(onDeleteId)
            setOnDeleteId(null)
          }}
          onOpenChange={() => setOnDeleteId(null)}
        />
      )}
      <Table
        heading={'Webhooks'}
        headers={headers}
        rows={rows}
        onDelete={setOnDeleteId}
        onAdd={() => setAddModelOpen(true)}
        onEdit={setOnEditWebhook}
      />
    </PrimaryLayout>
  )
}
