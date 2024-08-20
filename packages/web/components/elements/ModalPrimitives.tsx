import { Root, Overlay, Content } from '@radix-ui/react-dialog'
import { styled, keyframes, theme } from '../tokens/stitches.config'
import { Button } from './Button'
import { CloseButton } from './CloseButton'
import { HStack, SpanBox } from './LayoutPrimitives'
import { StyledText } from './StyledText'

export const ModalRoot = styled(Root, {})

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

export const ModalOverlay = styled(Overlay, {
  backgroundColor: '$overlay',
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  zIndex: 10,
  inset: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
})

const Modal = styled(Content, {
  backgroundColor: '$grayBg',
  borderRadius: 6,
  boxShadow: theme.shadows.cardBoxShadow.toString(),
  position: 'fixed',
  '&:focus': { outline: 'none' },
})

export const ModalContent = styled(Modal, {
  top: '50%',
  left: '50%',
  bg: '$readerBg',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  '@smDown': {
    maxWidth: '95%',
    width: '95%',
  },
  zIndex: '10',
})

export type ModalTitleBarProps = {
  title: string
  onOpenChange: (open: boolean) => void
}

export const ModalTitleBar = (props: ModalTitleBarProps) => {
  return (
    <HStack
      distribution="between"
      alignment="center"
      css={{ height: '50px', width: '100%' }}
    >
      <StyledText style="modalHeadline">{props.title}</StyledText>
      <SpanBox css={{ ml: 'auto' }}>
        <CloseButton close={() => props.onOpenChange(false)} />
      </SpanBox>
    </HStack>
  )
}

type ModalButtonBarProps = {
  acceptButtonLabel?: string
  onOpenChange: (open: boolean) => void
}

export const ModalButtonBar = (props: ModalButtonBarProps) => {
  return (
    <HStack
      alignment="center"
      distribution="end"
      css={{
        gap: '10px',
        width: '100%',
        height: '80px',
        'input:focus': {
          outline: '5px auto -webkit-focus-ring-color',
        },
        'button:focus': {
          outline: '5px auto -webkit-focus-ring-color',
        },
      }}
    >
      <Button
        style={'cancelGeneric'}
        type="button"
        onClick={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
      >
        {'Cancel'}
      </Button>
      <Button style={'ctaDarkYellow'}>
        {props.acceptButtonLabel || 'Submit'}
      </Button>
    </HStack>
  )
}
