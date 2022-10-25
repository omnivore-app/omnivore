import { useCallback, useState } from 'react'
import { styled } from '@stitches/react'
import Link from 'next/link'

import { Box, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { FormInput } from '../../elements/FormElements'

import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px auto 20px auto',
})

export function Readwise(): JSX.Element {
  const [token, setToken] = useState<string>('')
  const [errorMessage, setErrorMessage] =
    useState<string | undefined>(undefined)

  const setReadwiseToken = useCallback(() => {
    setIntegrationMutation({
      token,
      type: 'READWISE',
      enabled: true,
    })
    console.log('SETTING READWISE TOKEN', token)
  }, [token])

  return (
    <>
      <Header css={{ textAlign: 'center' }}>Readwise</Header>
      <VStack
        distribution={'start'}
        css={{
          width: '80%',
          margin: '0 auto',
          height: '500px',
        }}
      >
        <Header>
          Enter your API key from Readwise below. You can get your token{' '}
          <Link
            style={{ color: '$utilityTextDefault' }}
            href="https://readwise.io/access_token"
          >
            here
          </Link>
        </Header>
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
            margin: '20px auto 20px auto',
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
        <Button
          style="ctaDarkYellow"
          css={{ my: '$2', margin:'0 auto' }}
          onClick={setReadwiseToken}
        >
          Set Token
        </Button>
      </VStack>
    </>
  )
}
