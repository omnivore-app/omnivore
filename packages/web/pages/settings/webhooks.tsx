import { SettingsLayout } from '../../components/templates/SettingsLayout'
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
import { Box } from '../../components/elements/LayoutPrimitives'

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

interface EventTypeOption {
  label: string
  value: WebhookEvent
}

export default function Webhooks(): JSX.Element {
  const { webhooks, revalidate } = useGetWebhooksQuery()
  const [onDeleteId, setOnDeleteId] = useState<string | null>(null)
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [onEditWebhook, setOnEditWebhook] = useState<Webhook | null>(null)
  const [url, setUrl] = useState('')
  const eventTypeOptions: EventTypeOption[] = [
    { label: 'PAGE_CREATED', value: 'PAGE_CREATED' },
    { label: 'PAGE_UPDATED', value: 'PAGE_UPDATED' },
    { label: 'HIGHLIGHT_CREATED', value: 'HIGHLIGHT_CREATED' },
    { label: 'LABEL_ADDED', value: 'LABEL_CREATED' },
  ]
  const [eventTypes, setEventTypes] = useState<WebhookEvent[]>([])
  const [contentType, setContentType] = useState('application/json')
  const [method, setMethod] = useState('POST')
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])

  const headers = ['URL', 'Event Types', 'Method', 'Content Type']
  const rows = useMemo(() => {
    const rows = new Map<string, Webhook>()
    webhooks.forEach((webhook) =>
      rows.set(webhook.id, {
        url: webhook.url,
        eventTypes: eventTypeOptions
          .filter((option) => webhook.eventTypes.includes(option.value))
          .map((option) => option.label)
          .join(', '),
        method: webhook.method,
        contentType: webhook.contentType,
      })
    )
    return rows
  }, [webhooks])

  applyStoredTheme()

  function validateEventTypes(eventTypes: WebhookEvent[]): boolean {
    if (eventTypes.length > 0) return true
    showErrorToast('Please select at least one event type', {
      position: 'bottom-right',
    })
    return false
  }

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
    if (!validateEventTypes(eventTypes)) return
    const result = await setWebhookMutation({ url, eventTypes })
    if (result) {
      showSuccessToast('Webhook created', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to add', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function onUpdate(): Promise<void> {
    if (!validateEventTypes(eventTypes)) return
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
    <SettingsLayout>
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
          setUrl('')
          setEventTypes(['PAGE_CREATED', 'HIGHLIGHT_CREATED'])
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
                webhook?.eventTypes.includes(option.label)
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
          setUrl(webhook?.url)
          setEventTypes(webhook?.eventTypes)
          setOnEditWebhook(webhook)
        }}
      />
      <Box css={{ height: '120px' }} />
    </SettingsLayout>
  )
}
