import { Root, Overlay, Content } from '@radix-ui/react-dialog'
import { X } from 'phosphor-react'
import { styled, keyframes, theme } from '../tokens/stitches.config'
import { Button } from './Button'
import { HStack } from './LayoutPrimitives'
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
  inset: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
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
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  '@smDown': {
    maxWidth: '95%',
    width: '95%',
  },
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
      css={{ height: '68px', width: '100%' }}
    >
      <StyledText style="modalHeadline" css={{  }}>
        {props.title}
      </StyledText>
      <Button
        css={{ ml: 'auto' }}
        style="ghost"
        onClick={() => {
          props.onOpenChange(false)
        }}
      >
        <X
          size={24}
          color={theme.colors.textNonessential.toString()}
        />
      </Button>
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
      }}
    >
      <Button style={'ctaOutlineYellow'} type="button" onClick={(event) => {
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