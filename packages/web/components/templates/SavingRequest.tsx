import { VStack, Box } from '../elements/LayoutPrimitives'
import { keyframes } from '@stitches/react'
import { theme } from '../tokens/stitches.config'
import { StyledText } from '../elements/StyledText'

export function Loader(): JSX.Element {
  const breathe = keyframes({
    '0%': { content: '' },
    '25%': { content: '.' },
    '50%': { content: '..' },
    '75%': { content: '...' },
    '100%': { content: '....' },
  })

  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        pt: '$6',
        width: '100%',
      }}
    >
      <Box>
        <LogoIcon
          size={140}
          strokeColor={theme.colors.grayText.toString()}
        />
      </Box>
      <StyledText style="subHeadline" className='loading'
        css={{
          color: theme.colors.grayText.toString(),
          '&:after': {
            width: '10px',
            display: 'inline-block',
            content: '',
            animation: `${breathe} steps(1,end) 2s infinite`,
          },
        }}>Saving Link</StyledText>
    </VStack>
  )
}

type OmnivoreLogoProps = {
  size: number
  strokeColor: string
}

type ErrorComponentProps = {
  errorMessage: string
}

export function ErrorComponent(props: ErrorComponentProps): JSX.Element {
  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        pt: '$6',
        px: '$3',
        width: '100%',
      }}
    >
      <StyledText style="body">{props.errorMessage}</StyledText>
    </VStack>
  )
}

function LogoIcon(props: OmnivoreLogoProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 57 57`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.5503 0.479336C42.8399 -0.615769 56.6174 11.6057 56.6866 27.8604L56.6866 27.8711C56.6866 29.6944 56.2444 31.8904 55.8059 33.7698L55.7993 33.7981C54.646 38.4938 50.4426 41.785 45.5948 41.785H45.4694C39.4942 41.785 35.7573 36.8705 35.7573 31.4458V25.2774L32.2246 30.5111L31.9446 30.7416C29.9553 32.3798 27.1179 32.3798 25.1287 30.7416L24.8561 30.5171L21.1906 25.1734V39.3477H16.1906V22.4777C16.1906 18.9408 20.3858 16.8769 23.1736 19.3549L23.4017 19.5576L28.4834 26.9659C28.5017 26.9689 28.5195 26.9703 28.5366 26.9703C28.5521 26.9703 28.5681 26.9692 28.5845 26.9667L33.5618 19.593L33.8347 19.3656C36.4718 17.168 40.7573 18.8235 40.7573 22.5404V31.4458C40.7573 34.6756 42.79 36.785 45.4694 36.785H45.5948C48.1426 36.785 50.333 35.0653 50.9402 32.6185C51.3772 30.744 51.6856 29.06 51.6866 27.8765C51.6274 14.6592 40.4473 4.55774 26.8882 5.4679C15.4665 6.2608 6.23647 15.4909 5.4436 26.9126C4.53914 40.3884 15.1784 51.6482 28.5366 51.6482V56.6482C12.2949 56.6482 -0.645785 42.9493 0.455037 26.5745L0.455389 26.5694C1.41963 12.6567 12.6324 1.44393 26.5451 0.479688L26.5503 0.479336Z"
        fill={props.strokeColor}
      />
    </svg>
  )
}
