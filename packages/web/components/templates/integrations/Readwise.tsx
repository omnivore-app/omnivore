import { useCallback, useState } from 'react'
import { styled } from '@stitches/react'
import Link from 'next/link'
import Image from 'next/image'

import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { FormInput } from '../../elements/FormElements'

import { setIntegrationMutation } from '../../../lib/networking/mutations/setIntegrationMutation'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
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

      <HStack
        css={{
          fontSize: '18px',
          color: '$utilityTextDefault',
          m: '20px',
        }}
      >
        Enter your API key from Readwise below. You can get your token
        <Link
          style={{ color: '$utilityTextDefault' }}
          href="https://readwise.io/access_token"
        >
          here
        </Link>
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
          margin: '20px',
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
        css={{ my: '$2', margin: '20px' }}
        onClick={setReadwiseToken}
      >
        Set Token
      </Button>
    </VStack>
  )
}
