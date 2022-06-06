import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useMemo, useState } from 'react'
import { useGetApiKeysQuery } from '../../lib/networking/queries/useGetApiKeysQuery'
import { FormInputProps } from '../../components/elements/FormElements'
import { generateApiKeyMutation } from '../../lib/networking/mutations/generateApiKeyMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { FormModal } from '../../components/patterns/FormModal'

interface ApiKey {
  name: string
  scopes: string
  expiresAt: string
  usedAt: string
}

export default function ApiKeys(): JSX.Element {
  const { apiKeys, revalidate } = useGetApiKeysQuery()
  // const [onDeleteId, setOnDeleteId] = useState<string | null>(null)
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [name, setName] = useState('')
  // const [scopes, setScopes] = useState<string[] | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<Date>(new Date())
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])

  const headers = ['Name', 'Scopes', 'Used on', 'Expires on']
  const rows = useMemo(() => {
    const rows = new Map<string, ApiKey>()
    apiKeys.forEach((apiKey) =>
      rows.set(apiKey.id, {
        name: apiKey.name,
        scopes: apiKey.scopes.join(', ') || 'All',
        usedAt: apiKey.usedAt?.toISOString() || 'Never used',
        expiresAt: new Date(apiKey.expiresAt).toDateString(),
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

  async function onCreate(): Promise<void> {
    const result = await generateApiKeyMutation({ name, expiresAt })
    if (result) {
      showSuccessToast('Api key generated', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to add', { position: 'bottom-right' })
    }
    revalidate()
  }

  return (
    <PrimaryLayout pageTestId={'api-keys'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      {addModelOpen && (
        <FormModal
          title={'Generate Api Key'}
          onSubmit={onCreate}
          onOpenChange={setAddModelOpen}
          inputs={formInputs}
          acceptButtonLabel={'Generate'}
        />
      )}

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
        onAdd={() => {
          setFormInputs([
            {
              label: 'Name',
              onChange: setName,
              name: 'name',
              required: true,
            },
            {
              label: 'Expired at',
              name: 'expiredAt',
              required: true,
              onChange: setExpiresAt,
              type: 'date',
            },
          ])
          setName('')
          setExpiresAt(new Date(Date.now() + 1000 * 60 * 60 * 24 * 365))
          setAddModelOpen(true)
        }}
      />
    </PrimaryLayout>
  )
}
