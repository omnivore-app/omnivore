import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Toaster } from 'react-hot-toast'
import { Table } from '../../components/elements/Table'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useEffect, useMemo, useState } from 'react'
import { useGetApiKeysQuery } from '../../lib/networking/queries/useGetApiKeysQuery'
import { FormInputProps } from '../../components/elements/FormElements'
import { generateApiKeyMutation } from '../../lib/networking/mutations/generateApiKeyMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { FormModal } from '../../components/patterns/FormModal'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { revokeApiKeyMutation } from '../../lib/networking/mutations/revokeApiKeyMutation'
import { useRouter } from 'next/router'

interface ApiKey {
  name: string
  scopes: string
  expiresAt: string
  usedAt: string
}

export default function Api(): JSX.Element {
  const router = useRouter()

  // default expiry date is 1 year from now
  const defaultExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
    .toISOString()
    .split('T')[0]

  const { apiKeys, revalidate } = useGetApiKeysQuery()
  const [onDeleteId, setOnDeleteId] = useState<string>('')
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [name, setName] = useState('')
  // const [scopes, setScopes] = useState<string[] | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<Date>(new Date())
  const [formInputs, setFormInputs] = useState<FormInputProps[]>([])
  const [apiKeyGenerated, setApiKeyGenerated] = useState('')

  useEffect(() => {
    const createName = router.query.create as string
    if (router.isReady && createName) {
      console.log('isReady:', router.isReady)
      console.log('query', router.query.create)
      setFormInputs([
        {
          label: 'Name',
          onChange: setName,
          name: 'name',
          required: true,
          // Note here that we use `createName` and not name because setName
          // is async so even if we call it before setFormInputs it might
          // not have the value set yet.
          value: createName,
        },
        {
          label: 'Expires in',
          name: 'expiredAt',
          required: true,
          onChange: (e) => {
            let additionalDays = 0
            switch (e.target.value) {
              case '7 days':
                additionalDays = 7
                break
              case '30 days':
                additionalDays = 30
                break
              case '90 days':
                additionalDays = 90
                break
              case '1 year':
                additionalDays = 365
                break
            }
            const newExpires = new Date()
            newExpires.setDate(newExpires.getDate() + additionalDays)
            setExpiresAt(newExpires)
          },
          type: 'select',
          options: ['7 days', '30 days', '90 days', '1 year'],
          value: defaultExpiresAt,
        },
      ])
      setName(createName)
      setAddModelOpen(true)
    }
  }, [router])

  const headers = ['Name', 'Scopes', 'Used at', 'Expires on']
  const rows = useMemo(() => {
    const rows = new Map<string, ApiKey>()
    apiKeys.forEach((apiKey) =>
      rows.set(apiKey.id, {
        name: apiKey.name,
        scopes: apiKey.scopes.join(', ') || 'All',
        usedAt: apiKey.usedAt
          ? new Date(apiKey.usedAt).toISOString()
          : 'Never used',
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
              label: 'Expires in',
              name: 'expiredAt',
              required: true,
              onChange: (e) => {
                let additionalDays = 0
                switch (e.target.value) {
                  case '7 days':
                    additionalDays = 7
                    break
                  case '30 days':
                    additionalDays = 30
                    break
                  case '90 days':
                    additionalDays = 90
                    break
                  case '1 year':
                    additionalDays = 365
                    break
                }
                const newExpires = new Date()
                newExpires.setDate(newExpires.getDate() + additionalDays)
                setExpiresAt(newExpires)
              },
              type: 'select',
              options: ['7 days', '30 days', '90 days', '1 year'],
              value: defaultExpiresAt,
            },
          ])
          setName('')
          setExpiresAt(new Date(defaultExpiresAt))
          setAddModelOpen(true)
        }}
      />
    </PrimaryLayout>
  )
}
