import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import {
  useGetWebhooksQuery,
  WebhookEvent,
} from '../../lib/networking/queries/useGetWebhooksQuery'
import { useMemo, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'
import { FormModal } from '../../components/patterns/FormModal'
import { setWebhookMutation } from '../../lib/networking/mutations/setWebhookMutation'
import { FormInputProps } from '../../components/elements/FormElements'

interface Webhook {
  id?: string
  url: string
  eventTypes: string
  contentType?: string
  method?: string
  enabled?: string
  createdAt?: Date
  updatedAt?: Date
}

export default function Webhooks(): JSX.Element {
  const { webhooks, revalidate } = useGetWebhooksQuery()
  const [onDeleteId, setOnDeleteId] = useState<string | null>(null)
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [onEditWebhook, setOnEditWebhook] = useState<Webhook | null>(null)
  const [url, setUrl] = useState('')
  const [eventTypes, setEventTypes] = useState<WebhookEvent[]>([])
  const [contentType, setContentType] = useState('application/json')
  const [method, setMethod] = useState('POST')
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])
  const eventTypeOptions = ['PAGE_CREATED', 'HIGHLIGHT_CREATED']

  const headers = ['URL', 'Event Types', 'Method', 'Content Type']
  const rows = useMemo(() => {
    const rows = new Map<string, Webhook>()
    webhooks.forEach((webhook) =>
      rows.set(webhook.id, {
        url: webhook.url,
        eventTypes: webhook.eventTypes.join(', '),
        method: webhook.method,
        contentType: webhook.contentType,
      })
    )
    return rows
  }, [webhooks])

  applyStoredTheme(false)

  async function onDelete(id: string): Promise<void> {
    const result = await deleteWebhookMutation(id)
    if (result) {
      showSuccessToast('Webhook deleted', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to delete', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function onCreate(): Promise<void> {
    const result = await setWebhookMutation({ url, eventTypes })
    if (result) {
      showSuccessToast('Webhook created', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to add', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function onUpdate(): Promise<void> {
    const result = await setWebhookMutation({
      id: onEditWebhook?.id,
      url,
      eventTypes,
    })
    if (result) {
      showSuccessToast('Webhook updated', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to update', { position: 'bottom-right' })
    }
    revalidate()
  }

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
          onSubmit={onCreate}
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
        onAdd={() => {
          setFormInputs([
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
              value: [true, true],
              onChange: setEventTypes,
              options: eventTypeOptions,
              type: 'checkbox',
            },
            {
              label: 'Method',
              name: 'method',
              value: method,
              disabled: true,
            },
            {
              label: 'Content Type',
              name: 'contentType',
              value: contentType,
              disabled: true,
            },
          ])
          setAddModelOpen(true)
        }}
        onEdit={(webhook) => {
          setFormInputs([
            {
              label: 'URL',
              onChange: setUrl,
              name: 'url',
              value: webhook?.url,
              required: true,
            },
            {
              label: 'Event Types',
              name: 'eventTypes',
              value: eventTypeOptions.map((option) =>
                webhook?.eventTypes.includes(option)
              ),
              onChange: setEventTypes,
              options: eventTypeOptions,
              type: 'checkbox',
            },
            {
              label: 'Method',
              name: 'method',
              value: method,
              disabled: true,
            },
            {
              label: 'Content Type',
              name: 'contentType',
              value: contentType,
              disabled: true,
            },
          ])
          setOnEditWebhook(webhook)
        }}
      />
    </PrimaryLayout>
  )
}
