import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import {
  useGetWebhooksQuery,
  WebhookEvent,
} from '../../lib/networking/queries/useGetWebhooksQuery'
import { useCallback, useMemo, useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { deleteWebhookMutation } from '../../lib/networking/mutations/deleteWebhookMutation'
import { FormModal } from '../../components/patterns/FormModal'
import { setWebhookMutation } from '../../lib/networking/mutations/setWebhookMutation'
import { FormInputProps } from '../../components/elements/FormElements'
import { Box } from '../../components/elements/LayoutPrimitives'
import { CheckedState } from '@radix-ui/react-checkbox'

const DEFAULT_SELECTED_EVENTS: WebhookEvent[] = [
  'PAGE_CREATED',
  'HIGHLIGHT_CREATED',
]

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [onEditWebhook, setOnEditWebhook] = useState<Webhook | null>(null)
  const [url, setUrl] = useState('')
  const [eventTypes, setEventTypes] = useState<Set<WebhookEvent>>(
    new Set(DEFAULT_SELECTED_EVENTS)
  )
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])
  const headers = ['URL', 'Event Types', 'Method', 'Content Type']

  const onCheckedChange = useCallback(
    (event: WebhookEvent, checked: CheckedState) => {
      if (checked === true) {
        setEventTypes((eventTypes) => {
          const updatedEventTypes = new Set(eventTypes)
          updatedEventTypes.add(event)
          return updatedEventTypes
        })
      } else if (checked === false) {
        setEventTypes((eventTypes) => {
          const updatedEventTypes = new Set(eventTypes)
          updatedEventTypes.delete(event)
          return updatedEventTypes
        })
      }
    },
    []
  )

  const getEventTypeInputOptions = useCallback(
    (eventTypes: Set<WebhookEvent>) => [
      {
        label: 'PAGE_CREATED',
        value: 'PAGE_CREATED' as WebhookEvent,
        defaultChecked: eventTypes.has('PAGE_CREATED'),
        onCheckedChange: (checked: CheckedState) =>
          onCheckedChange('PAGE_CREATED', checked),
      },
      {
        label: 'HIGHLIGHT_CREATED',
        value: 'HIGHLIGHT_CREATED' as WebhookEvent,
        defaultChecked: eventTypes.has('HIGHLIGHT_CREATED'),
        onCheckedChange: (checked: CheckedState) =>
          onCheckedChange('HIGHLIGHT_CREATED', checked),
      },
      {
        label: 'LABEL_CREATED',
        value: 'LABEL_CREATED' as WebhookEvent,
        defaultChecked: eventTypes.has('LABEL_CREATED'),
        onCheckedChange: (checked: CheckedState) =>
          onCheckedChange('LABEL_CREATED', checked),
      },
    ],
    [onCheckedChange]
  )

  const rows = useMemo(() => {
    const rows = new Map<string, Webhook>()
    webhooks.forEach((webhook) =>
      rows.set(webhook.id, {
        url: webhook.url,
        eventTypes: getEventTypeInputOptions(eventTypes)
          .filter((option) =>
            webhook.eventTypes.includes(option.value as WebhookEvent)
          )
          .map((option) => option.label)
          .join(', '),
        method: webhook.method,
        contentType: webhook.contentType,
      })
    )
    return rows
  }, [eventTypes, getEventTypeInputOptions, webhooks])

  applyStoredTheme(false)

  function validateEventTypes(eventTypes: Set<WebhookEvent>): boolean {
    if (eventTypes.size > 0) return true
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
    const result = await setWebhookMutation({
      url,
      eventTypes: Array.from(eventTypes),
    })
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
      eventTypes: Array.from(eventTypes),
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

      {isAddModalOpen && (
        <FormModal
          title={'Add webhook'}
          onSubmit={onCreate}
          onOpenChange={setIsAddModalOpen}
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
          setUrl('')
          setEventTypes(new Set(DEFAULT_SELECTED_EVENTS))
          setIsAddModalOpen(true)
          setFormInputs([
            {
              type: 'text',
              label: 'URL',
              onChange: (event) => {
                setUrl(event.target.value)
              },
              name: 'url',
              placeholder: 'https://example.com/webhook',
              required: true,
            },
            {
              label: 'Event Types',
              name: 'eventTypes',
              options: getEventTypeInputOptions(
                new Set(DEFAULT_SELECTED_EVENTS)
              ),
              type: 'multi-checkbox',
            },
            {
              type: 'text',
              label: 'Method',
              name: 'method',
              value: 'POST',
              disabled: true,
            },
            {
              label: 'Content Type',
              name: 'contentType',
              value: 'application/json',
              disabled: true,
              type: 'text',
            },
          ])
        }}
        onEdit={(webhook) => {
          setUrl(webhook?.url)
          setEventTypes(new Set(webhook?.eventTypes.split(', ')))
          setOnEditWebhook(webhook)
          setFormInputs([
            {
              label: 'URL',
              onChange: (event) => setUrl(event.target.value),
              name: 'url',
              value: webhook?.url,
              required: true,
              type: 'text',
            },
            {
              label: 'Event Types',
              name: 'eventTypes',
              options: getEventTypeInputOptions(
                new Set(webhook?.eventTypes.split(', '))
              ),
              type: 'multi-checkbox',
            },
            {
              type: 'text',
              label: 'Method',
              name: 'method',
              value: 'POST',
              disabled: true,
            },
            {
              type: 'text',
              label: 'Content Type',
              name: 'contentType',
              value: 'application/json',
              disabled: true,
            },
          ])
        }}
      />
      <Box css={{ height: '120px' }} />
    </SettingsLayout>
  )
}
