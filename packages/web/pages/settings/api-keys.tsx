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
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { revokeApiKeyMutation } from '../../lib/networking/mutations/revokeApiKeyMutation'

interface ApiKey {
  name: string
  scopes: string
  expiresAt: string
  usedAt: string
}

export default function ApiKeys(): JSX.Element {
  const { apiKeys, revalidate } = useGetApiKeysQuery()
  const [onDeleteId, setOnDeleteId] = useState<string>('')
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [name, setName] = useState('')
  // const [scopes, setScopes] = useState<string[] | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<Date>(new Date())
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])
  const [apiKeyGenerated, setApiKeyGenerated] = useState('')

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

  async function onDelete(id: string): Promise<void> {
    const result = await revokeApiKeyMutation(id)
    if (result) {
      showSuccessToast('API Key deleted', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to delete', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function onCreate(): Promise<void> {
    const result = await generateApiKeyMutation({ name, expiresAt })
    if (result) {
      setApiKeyGenerated(result)
      showSuccessToast('API key generated', { position: 'bottom-right' })
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
          title={'Generate API Key'}
          onSubmit={onCreate}
          onOpenChange={setAddModelOpen}
          inputs={formInputs}
          acceptButtonLabel={'Generate'}
        />
      )}

      {apiKeyGenerated && (
        <ConfirmationModal
          message={`API key generated. Copy the key and use it in your application.
                    You won’t be able to see it again!
                    Key: ${apiKeyGenerated}`}
          acceptButtonLabel={'Copy'}
          onAccept={async () => {
            await navigator.clipboard.writeText(apiKeyGenerated)
            setApiKeyGenerated('')
          }}
          onOpenChange={() => setApiKeyGenerated('')}
        />
      )}

      {onDeleteId && (
        <ConfirmationModal
          message={'API key would be revoked. This action cannot be undone.'}
          onAccept={async () => {
            await onDelete(onDeleteId)
            setOnDeleteId('')
          }}
          onOpenChange={() => setOnDeleteId('')}
        />
      )}
      <Table
        heading={'API Keys'}
        headers={headers}
        rows={rows}
        onDelete={setOnDeleteId}
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
