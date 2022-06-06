import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useMemo } from 'react'
import { useGetApiKeysQuery } from '../../lib/networking/queries/useGetApiKeysQuery'

interface ApiKey {
  name: string
  scopes: string
  expiresAt: string
  usedAt: string
}

export default function ApiKeys(): JSX.Element {
  const { apiKeys, revalidate } = useGetApiKeysQuery()
  // const [onDeleteId, setOnDeleteId] = useState<string | null>(null)
  // const [addModelOpen, setAddModelOpen] = useState(false)
  // const [url, setUrl] = useState('')
  // const [formInputs, setFormInputs] = useState<FormInputProps[]>([])

  const headers = ['Name', 'Scopes', 'Used at', 'Expires at']
  const rows = useMemo(() => {
    const rows = new Map<string, ApiKey>()
    apiKeys.forEach((apiKey) =>
      rows.set(apiKey.id, {
        name: apiKey.name,
        scopes: apiKey.scopes.join(', '),
        usedAt: apiKey.usedAt?.toISOString() || 'Never',
        expiresAt: apiKey.expiresAt.toISOString(),
      })
    )
    return rows
  }, [apiKeys])

  applyStoredTheme(false)

  // async function onDelete(id: string): Promise<void> {
  //   const result = await deleteWebhookMutation(id)
  //   if (result) {
  //     showSuccessToast('Webhook deleted', { position: 'bottom-right' })
  //   } else {
  //     showErrorToast('Failed to delete', { position: 'bottom-right' })
  //   }
  //   revalidate()
  // }
  //
  // async function onCreate(): Promise<void> {
  //   const result = await setWebhookMutation({ url, eventTypes })
  //   if (result) {
  //     showSuccessToast('Webhook created', { position: 'bottom-right' })
  //   } else {
  //     showErrorToast('Failed to add', { position: 'bottom-right' })
  //   }
  //   revalidate()
  // }

  return (
    <PrimaryLayout pageTestId={'api-keys'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {/*{addModelOpen && (*/}
      {/*  <FormModal*/}
      {/*    title={'Add webhook'}*/}
      {/*    onSubmit={onCreate}*/}
      {/*    onOpenChange={setAddModelOpen}*/}
      {/*    inputs={formInputs}*/}
      {/*    acceptButtonLabel={'Add'}*/}
      {/*  />*/}
      {/*)}*/}

      {/*{onDeleteId && (*/}
      {/*  <ConfirmationModal*/}
      {/*    message={*/}
      {/*      'Future events will no longer be delivered to this webhook. This action cannot be undone.'*/}
      {/*    }*/}
      {/*    onAccept={async () => {*/}
      {/*      await onDelete(onDeleteId)*/}
      {/*      setOnDeleteId(null)*/}
      {/*    }}*/}
      {/*    onOpenChange={() => setOnDeleteId(null)}*/}
      {/*  />*/}
      {/*)}*/}
      <Table
        heading={'Api Keys'}
        headers={headers}
        rows={rows}
        // onDelete={setOnDeleteId}
        // onAdd={() => {
        //   setFormInputs([
        //     {
        //       label: 'URL',
        //       onChange: setUrl,
        //       name: 'url',
        //       placeholder: 'https://example.com/webhook',
        //       required: true,
        //     },
        //     {
        //       label: 'Event Types',
        //       name: 'eventTypes',
        //       value: [true, true],
        //       onChange: setEventTypes,
        //       options: eventTypeOptions,
        //       type: 'checkbox',
        //     },
        //     {
        //       label: 'Method',
        //       name: 'method',
        //       value: method,
        //       disabled: true,
        //     },
        //     {
        //       label: 'Content Type',
        //       name: 'contentType',
        //       value: contentType,
        //       disabled: true,
        //     },
        //   ])
        //   setUrl('')
        //   setEventTypes(eventTypeOptions as WebhookEvent[])
        //   setAddModelOpen(true)
        // }}
      />
    </PrimaryLayout>
  )
}
