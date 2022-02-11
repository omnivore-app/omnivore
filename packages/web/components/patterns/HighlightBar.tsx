import { Button } from '../elements/Button'
import { HStack, Box } from '../elements/LayoutPrimitives'
import { AnchoredPopover } from '../patterns/AnchoredPopover'
import { StyledText } from '../elements/StyledText'
import { highlightBarKeyboardCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { styled, theme } from '../tokens/stitches.config'
import { PenIcon } from '../elements/images/PenIcon'
import { CommentIcon } from '../elements/images/CommentIcon'
import { ShareIcon } from '../elements/images/ShareIcon'
import { TrashIcon } from '../elements/images/TrashIcon'
import { isAndroid } from '../../lib/deviceType'

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

type HighlightBarProps = {
  anchorCoordinates: PageCoordinates
  isNewHighlight: boolean
  isSharedToFeed: boolean
  isTouchscreenDevice: boolean
  handleButtonClick: (action: HighlightAction) => void
}

export function HighlightBar(props: HighlightBarProps): JSX.Element {
  if (props.isTouchscreenDevice) {
    return (
      <Box
        css={{
          width: '100%',
          maxWidth: '240px',
          height: '48px',
          position: 'fixed',
          background: '$grayBg',
          borderRadius: '4px',
          border: '1px solid $grayBorder',
          boxShadow: '0px 0px 9px -2px rgba(32, 31, 29, 0.09), 0px 7px 12px rgba(32, 31, 29, 0.07)',
          bottom: 'calc(38px + env(safe-area-inset-bottom, 40px))',
          '@smDown': {
            maxWidth: '80%',
            bottom: `calc(28px + ${isAndroid() ? 30 : 0}px + env(safe-area-inset-bottom, 40px))`,
          },
        }}
      >
        <BarContent {...props} />
      </Box>
    )
  } else {
    return (
      <AnchoredPopover
        xAnchorCoordinate={props.anchorCoordinates.pageX}
        yAnchorCoordinate={props.anchorCoordinates.pageY}
        preventAutoFocus={false}
      >
        <BarContent {...props} />
      </AnchoredPopover>
    )
  }
}

function BarContent(props: HighlightBarProps): JSX.Element {
  useKeyboardShortcuts(
    highlightBarKeyboardCommands((action) => {
      switch (action) {
        case 'createHighlight':
          props.handleButtonClick('create')
          break
        case 'openNoteModal':
          props.handleButtonClick('comment')
          break
        case 'openPostModal':
          break
      }
    })
  )

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
        width: props.isTouchscreenDevice ? '100%' : 'auto',
      }}
    >
      {props.isNewHighlight ? (
        <Button
          style="plainIcon"
          title="Create Highlight"
          onClick={() => props.handleButtonClick('create')}
          css={{
            flexDirection: 'column',
            height: '100%',
            m: 0,
            p: 0,
            pt: '6px',
            alignItems: 'baseline',
          }}
        >
          <HStack css={{ height: '100%', alignItems: 'center' }}>
            <PenIcon size={28} strokeColor={theme.colors.readerFont.toString()} />
            <StyledText
              style="body"
              css={{
                pb: '4px',
                pl: '12px',
                m: '0px',
                color: '$readerFont',
                fontWeight: '400',
                fontSize: '16px',
              }}
            >
              Highlight
            </StyledText>
          </HStack>
        </Button>
      ) : (
        <Button
          style="plainIcon"
          title="Remove Highlight"
          onClick={() => props.handleButtonClick('delete')}
          css={{ color: '$readerFont', height: '100%', m: 0, p: 0, pt: '6px' }}
        >
          <TrashIcon size={28} strokeColor={theme.colors.readerFont.toString()} />
        </Button>
      )}
      <Separator />
      <Button
        style="plainIcon"
        title="Add Note to Highlight"
        onClick={() => props.handleButtonClick('comment')}
        css={{ color: '$readerFont', height: '100%', m: 0, p: 0, pt: '6px' }}
      >
        <CommentIcon size={28} strokeColor={theme.colors.readerFont.toString()} />
      </Button>
      {/* <Separator />
      <Button
        style="plainIcon"
        title="Share Highlight"
        onClick={() => props.handleButtonClick('share')}
        css={{ color: '$readerFont', height: '100%', m: 0, p: 0, pt: '6px' }}
      >
        <ShareIcon size={28} strokeColor={theme.colors.readerFont.toString()} isCompleted={false} />
      </Button> */}
    </HStack>
  )
}
