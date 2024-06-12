import { isAndroid } from '../../lib/deviceType'
import { styled, theme } from '../tokens/stitches.config'
import { Button } from '../elements/Button'
import { HStack, Box } from '../elements/LayoutPrimitives'
import { Circle, CheckCircle } from '@phosphor-icons/react'
import { LabelIcon } from '../elements/icons/LabelIcon'
import { NotebookIcon } from '../elements/icons/NotebookIcon'
import { highlightColor, highlightColors } from '../../lib/themeUpdater'
import { useState } from 'react'
import { CopyIcon } from '../elements/icons/CopyIcon'

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
  | 'updateColor'

type HighlightBarProps = {
  anchorCoordinates: PageCoordinates
  isNewHighlight: boolean
  isSharedToFeed: boolean
  displayAtBottom: boolean
  highlightColor?: string
  handleButtonClick: (action: HighlightAction, param?: string) => void
}

export function HighlightBar(props: HighlightBarProps): JSX.Element {
  return (
    <Box
      css={{
        // width: '295px',
        // height: '50px',
        position: props.displayAtBottom ? 'fixed' : 'absolute',
        background: '$thBackground2',
        borderRadius: '5px',
        border: '1px solid $thHighlightBar',
        boxShadow: `0px 4px 4px 0px rgba(0, 0, 0, 0.15)`,

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

const Separator = styled('div', {
  width: '1px',
  height: '20px',
  mx: '5px',
  background: '$thHighlightBar',
})

function BarContent(props: HighlightBarProps): JSX.Element {
  const [hovered, setHovered] = useState<string | undefined>(undefined)
  const size = props.displayAtBottom ? 35 : 25

  return (
    <HStack
      distribution="start"
      alignment="center"
      css={{
        display: 'flex',
        gap: '5px',
        maxWidth: '100%',
        width: props.displayAtBottom ? '100%' : 'auto',
        padding: props.displayAtBottom ? '10px 15px' : '5px 10px',
      }}
    >
      {highlightColors.map((color) => {
        return (
          <Button
            key={`color-${color}`}
            style="highlightBarIcon"
            title={`Create highlight (${color})`}
            onClick={() => {
              if (!props.isNewHighlight && props.highlightColor != color) {
                props.handleButtonClick('updateColor', color)
              } else if (
                !props.isNewHighlight &&
                props.highlightColor == color
              ) {
                props.handleButtonClick('delete')
              } else {
                props.handleButtonClick('create', color)
              }
            }}
            onMouseEnter={() => {
              setHovered(color)
            }}
            onMouseLeave={() => {
              setHovered(undefined)
            }}
          >
            {props.isNewHighlight || props.highlightColor != color ? (
              <Circle
                key={color}
                width={size}
                height={size}
                color={highlightColor(color)}
                weight="fill"
              />
            ) : (
              <CheckCircle
                key={color}
                width={size}
                height={size}
                color={highlightColor(color)}
                weight="fill"
              />
            )}
          </Button>
        )
      })}
      <Separator />
      {!props.isNewHighlight && (
        <>
          <Button
            title={`Set labels`}
            style="highlightBarIcon"
            onClick={() => props.handleButtonClick('setHighlightLabels')}
            onMouseEnter={() => {
              setHovered('labels')
            }}
            onMouseLeave={() => {
              setHovered(undefined)
            }}
          >
            <LabelIcon
              size={size}
              color={
                hovered == 'labels'
                  ? theme.colors.thTextContrast.toString()
                  : theme.colors.thHighlightBar.toString()
              }
            />
          </Button>
        </>
      )}

      <Button
        title={props.isNewHighlight ? `Create highlight w/note` : 'Add note'}
        style="highlightBarIcon"
        onClick={() => props.handleButtonClick('comment')}
        onMouseEnter={() => {
          setHovered('note')
        }}
        onMouseLeave={() => {
          setHovered(undefined)
        }}
      >
        <NotebookIcon
          size={size}
          color={
            hovered == 'note'
              ? theme.colors.thTextContrast.toString()
              : theme.colors.thHighlightBar.toString()
          }
        />
      </Button>
      <Button
        title={`Copy`}
        style="highlightBarIcon"
        onClick={() => props.handleButtonClick('copy')}
        onMouseEnter={() => {
          setHovered('copy')
        }}
        onMouseLeave={() => {
          setHovered(undefined)
        }}
      >
        <CopyIcon
          size={size}
          color={
            hovered == 'copy'
              ? theme.colors.thTextContrast.toString()
              : theme.colors.thHighlightBar.toString()
          }
        />
      </Button>
    </HStack>
  )
}
