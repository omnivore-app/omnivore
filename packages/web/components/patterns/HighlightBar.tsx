import { isAndroid } from '../../lib/deviceType'

import { styled, theme } from '../tokens/stitches.config'

import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { HStack, Box } from '../elements/LayoutPrimitives'
import { PenWithColorIcon } from '../elements/images/PenWithColorIcon'
import { Note, Tag, Trash, Copy } from 'phosphor-react'

type PageCoordinates = {
  pageX: number
  pageY: number
}

export type HighlightAction =
  | 'delete'
  | 'create'
  | 'comment'
  | 'share'
  | 'post'
  | 'unshare'
  | 'setHighlightLabels'
  | 'copy'

type HighlightBarProps = {
  anchorCoordinates: PageCoordinates
  isNewHighlight: boolean
  isSharedToFeed: boolean
  displayAtBottom: boolean
  handleButtonClick: (action: HighlightAction) => void
}

export function HighlightBar(props: HighlightBarProps): JSX.Element {
  return (
    <Box
      css={{
        width: '100%',
        maxWidth: props.isNewHighlight ? '330px' : '380px',
        height: '48px',
        position: props.displayAtBottom ? 'fixed' : 'absolute',
        background: '$grayBg',
        borderRadius: '4px',
        border: '1px solid $grayBorder',
        boxShadow: theme.shadows.cardBoxShadow.toString(),
        ...(props.displayAtBottom && {
          bottom: 'calc(38px + env(safe-area-inset-bottom, 40px))',
        }),
        ...(props.displayAtBottom && {
          '@smDown': {
            maxWidth: '90vw',
            bottom: `calc(28px + ${
              isAndroid() ? 30 : 0
            }px + env(safe-area-inset-bottom, 40px))`,
          },
        }),
        ...(!props.displayAtBottom && { left: props.anchorCoordinates.pageX }),
        ...(!props.displayAtBottom && { top: props.anchorCoordinates.pageY }),
      }}
    >
      <BarContent {...props} />
    </Box>
  )
}

type BarButtonProps = {
  title: string
  onClick: VoidFunction
  iconElement: JSX.Element
  text: string
}

function BarButton({ text, title, iconElement, onClick }: BarButtonProps) {
  return (
    <Button
      style="plainIcon"
      title={title}
      onClick={onClick}
      css={{
        flexDirection: 'column',
        height: '100%',
        m: 0,
        p: 0,
        alignItems: 'baseline',
      }}
    >
      <HStack css={{ height: '100%', alignItems: 'center' }}>
        {iconElement}
        <StyledText
          style="body"
          css={{
            pl: '4px',
            m: '0px',
            color: '$readerFont',
            fontWeight: '400',
            fontSize: '16px',
          }}
        >
          {text}
        </StyledText>
      </HStack>
    </Button>
  )
}

function BarContent(props: HighlightBarProps): JSX.Element {
  const Separator = styled('div', {
    width: '1px',
    maxWidth: '1px',
    height: '100%',
    background: '$grayBorder',
  })

  return (
    <HStack
      distribution="evenly"
      alignment="center"
      css={{
        height: '100%',
        alignItems: 'center',
        width: props.displayAtBottom ? '100%' : 'auto',
      }}
    >
      {props.isNewHighlight ? (
        <BarButton
          text="Highlight"
          title="Create Highlight"
          iconElement={<PenWithColorIcon />}
          onClick={() => props.handleButtonClick('create')}
        />
      ) : (
        <>
          <BarButton
            text="Delete"
            title="Remove Highlight"
            iconElement={
              <Trash size={20} color={theme.colors.omnivoreRed.toString()} />
            }
            onClick={() => props.handleButtonClick('delete')}
          />
          <Separator />
          <BarButton
            text="Labels"
            title="Set Labels"
            iconElement={
              <Tag size={20} color={theme.colors.readerFont.toString()} />
            }
            onClick={() => props.handleButtonClick('setHighlightLabels')}
          />
        </>
      )}
      <Separator />
      <BarButton
        text="Note"
        title="Add Note to Highlight"
        iconElement={
          <Note size={20} color={theme.colors.readerFont.toString()} />
        }
        onClick={() => props.handleButtonClick('comment')}
      />
      <Separator />
      <BarButton
        text="Copy"
        title="Copy Text to Clipboard"
        iconElement={
          <Copy size={20} color={theme.colors.readerFont.toString()} />
        }
        onClick={() => props.handleButtonClick('copy')}
      />
    </HStack>
  )
}
