import Link from 'next/link'
import { StyledText } from '../elements/StyledText'
import { VStack, Box } from '../elements/LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import {
  googleID,
  gauthRedirectURI,
  appleAuthRedirectURI,
} from '../../lib/appConfig'
import AppleLogin from 'react-apple-login'
import { formatMessage } from '../../locales/en/messages'

export type LoginFormProps = {
  errorMessage?: string
}

export function LoginForm(props: LoginFormProps): JSX.Element {
  console.log(props.errorMessage) // TODO: display message

  return (
    <VStack
      alignment="center"
      distribution="between"
      css={{
        maxWidth: '24em',
        textAlign: 'center',
        width: '90%',
      }}
    >
      <LoginFormHeader />

      {googleID && (
        <Box
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            height: '40px',
          }}
        >
          <GoogleAuthButton />
        </Box>
      )}

      <Box style={{ height: '16px' }}></Box>

      {appleAuthRedirectURI && (
        <Box
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            height: '40px',
          }}
        >
          <AppleLogin
            clientId="app.omnivore"
            scope="name email"
            state="web:login"
            redirectURI={appleAuthRedirectURI}
            responseMode="form_post"
            responseType="code id_token"
            designProp={{
              color: 'black',
              width: 300,
              height: 40,
              type: 'continue',
            }}
          />
        </Box>
      )}
      <TermAndConditionsFooter />
    </VStack>
  )
}

function LoginFormHeader() {
  const StyledTextHeadline = styled('h1', StyledText)

  return (
    <>
      <StyledTextHeadline
        style="fixedHeadline"
        css={{ mx: '$2', color: '$omnivoreGray', marginBlockEnd: '0px' }}
      >
        {formatMessage({ id: 'login.headline' })}
      </StyledTextHeadline>
      <Link passHref href="/about">
        <a style={{ textDecoration: 'none' }}>
          <StyledText
            css={{
              color: '$omnivoreRed',
              marginBlockStart: '8px',
              marginBlockEnd: '28px',
            }}
          >
            Learn More -&gt;
          </StyledText>
        </a>
      </Link>
    </>
  )
}

function GoogleAuthButton() {
  return (
    <Box css={{ pb: '$3' }}>
      <div
        id="g_id_onload"
        data-client_id={googleID}
        data-context="use"
        data-ux_mode="popup"
        data-login_uri={gauthRedirectURI}
        data-auto_prompt="false"
      />

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="continue_with"
        data-size="large"
        data-logo_alignment="center"
        data-width="300"
      />
    </Box>
  )
}

export function TermAndConditionsFooter(): JSX.Element {
  const StyledTextSpan = styled('span', StyledText)

  return (
    <StyledText
      style="caption"
      css={{
        maxWidth: '20em',
        textAlign: 'center',
        color: '$omnivoreLightGray',
      }}
    >
      By signing up, you agree to Omnivore’s{' '}
      <Link href="/terms" passHref>
        <StyledTextSpan style="captionLink" css={{ color: '$omnivoreGray' }}>
          Terms of Service
        </StyledTextSpan>
      </Link>{' '}
      and{' '}
      <Link href="/privacy" passHref>
        <StyledTextSpan style="captionLink" css={{ color: '$omnivoreGray' }}>
          Privacy Policy
        </StyledTextSpan>
      </Link>
    </StyledText>
  )
}
