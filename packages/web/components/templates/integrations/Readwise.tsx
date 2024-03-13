import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { deleteIntegrationMutation } from '../../../lib/networking/mutations/deleteIntegrationMutation'
import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'
import {
  Integration,
  useGetIntegrationsQuery,
} from '../../../lib/networking/queries/useGetIntegrationsQuery'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { Button } from '../../elements/Button'
import { FormInput } from '../../elements/FormElements'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { Header } from '../settings/SettingsTable'

export function Readwise(): JSX.Element {
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const readwiseIntegration = useMemo(() => {
    return integrations.find((i) => i.name == 'READWISE' && i.type == 'EXPORT')
  }, [integrations])

  return (
    <VStack
      distribution={'start'}
      alignment={'start'}
      css={{
        margin: '0 auto',
        width: '80%',
        height: '500px',
      }}
    >
      <HStack
        alignment={'start'}
        distribution={'start'}
        css={{
          width: '100%',
          pb: '$2',
          borderBottom: '1px solid $utilityTextDefault',
          pr: '$1',
        }}
      >
        <Image
          src="/static/icons/readwise.svg"
          alt="integration Image"
          width={75}
          height={75}
        />
        <Header>Readwise</Header>
      </HStack>

      {readwiseIntegration && (
        <RemoveReadwiseForm
          integration={readwiseIntegration}
          revalidate={revalidate}
        />
      )}

      {!readwiseIntegration && <AddReadwiseForm />}
    </VStack>
  )
}

function AddReadwiseForm(): JSX.Element {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const [token, setToken] = useState<string>('')

  const setReadwiseToken = useCallback(async () => {
    try {
      const result = await setIntegrationMutation({
        token,
        name: 'READWISE',
        type: 'EXPORT',
        enabled: true,
      })
      if (result) {
        router.push(`/settings/integrations`)
        showSuccessToast('Your Readwise API token has been set.')
      } else {
        setErrorMessage('There was an error connecting to Readwise.')
      }
    } catch (err) {
      setErrorMessage('Error: ' + err)
    }
  }, [token, router])

  return (
    <>
      <HStack
        css={{
          fontSize: '18px',
          color: '$utilityTextDefault',
          my: '20px',
          whiteSpace: 'pre-wrap',
        }}
      >
        <SpanBox>
          Enter your API key from Readwise below. You can get your token{' '}
          <a
            target="_blank"
            rel="noreferrer"
            referrerPolicy="no-referrer"
            style={{ color: '$utilityTextDefault' }}
            href="https://readwise.io/access_token"
          >
            here
          </a>
          .
        </SpanBox>
      </HStack>

      <FormInput
        type="token"
        key="token"
        value={token}
        placeholder={'Readwise Token'}
        onChange={(e) => {
          e.preventDefault()
          setToken(e.target.value)
        }}
        disabled={false}
        hidden={false}
        required={true}
        css={{
          border: '1px solid $textNonessential',
          borderRadius: '8px',
          width: '80%',
          bg: 'transparent',
          fontSize: '16px',
          textIndent: '8px',
          my: '20px',
          height: '38px',
          color: '$grayTextContrast',
          '&:focus': {
            outline: 'none',
            boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
          },
        }}
        min={200}
      />
      {errorMessage && <StyledText style="error">{errorMessage}</StyledText>}
      <Button style="ctaDarkYellow" css={{}} onClick={setReadwiseToken}>
        Set Token
      </Button>
    </>
  )
}

type RemoveReadwiseFormProps = {
  integration: Integration
  revalidate: () => void
}

function RemoveReadwiseForm(props: RemoveReadwiseFormProps): JSX.Element {
  const deleteIntegration = useCallback(async () => {
    try {
      if (props.integration.id) {
        const result = await deleteIntegrationMutation(props.integration.id)
        if (result) {
          props.revalidate()
          showSuccessToast('Integration Removed')
        } else {
          showErrorToast('Error removing Readwise integration.')
        }
      }
    } catch (err) {
      showErrorToast('Error: ' + err)
    }
  }, [props])

  return (
    <>
      <HStack
        css={{
          fontSize: '18px',
          color: '$utilityTextDefault',
          my: '20px',
          whiteSpace: 'pre-wrap',
        }}
      >
        <SpanBox>
          Omnivore is configured to send all your highlights to Readwise.
        </SpanBox>
      </HStack>

      <Button style="ctaDarkYellow" onClick={deleteIntegration}>
        Remove Readwise Integration
      </Button>
    </>
  )
}
