import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useCallback, useEffect, useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { styled } from '@stitches/react'
import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'

const BorderedFormInput = styled(FormInput, {
  height: '40px',
  paddingLeft: '6px',
  borderRadius: '6px',
  background: 'white',
  color: '$omnivoreGray',
  border: `1px solid 1px solid rgba(0, 0, 0, 0.06)`,
})

const FormLabel = styled('label', {
  fontSize: '16px',
  color: '$omnivoreGray',
})

export function Readwise(): JSX.Element {
  const [token, setToken] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const setReadwiseToken = useCallback(() => {
    setIntegrationMutation({
      token,
      type: 'READWISE',
      enabled: true,
    })
    console.log("SETTING READWISE TOKEN", token)
  }, [token])

  return (
    <VStack alignment="center" css={{ padding: '16px' }}>
      <VStack css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}>
        <SpanBox css={{ width: '100%' }}>
          <FormLabel>
            Enter your Readwise API token. You can get your token
            {' '}
            <a href="https://readwise.io/access_token">here</a>.
          </FormLabel>
          <BorderedFormInput
            type="token"
            key="token"
            value={token}
            placeholder="Readwise Token"
            onChange={(e) => { e.preventDefault(); setToken(e.target.value); }}
          />
        </SpanBox>
      </VStack>
      
      {errorMessage && (
        <StyledText style="error">{errorMessage}</StyledText>
      )}
      <Button style="ctaDarkYellow" css={{  my: '$2' }} onClick={setReadwiseToken}>
        Set Token
      </Button>
    </VStack>
  )
}
