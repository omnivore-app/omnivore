import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { DotsThreeVertical } from 'phosphor-react'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { setLabelsForHighlight } from '../../../lib/networking/mutations/setLabelsForHighlight'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { HighlightNoteTextEditArea } from '../../elements/HighlightNoteTextEditArea'
import { LabelChip } from '../../elements/LabelChip'
import {
  Blockquote,
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { SetLabelsModal } from '../article/SetLabelsModal'

type HighlightItemProps = {
  highlight: Highlight
  viewer: UserBasicData | undefined
  item: LibraryItemNode
}

const StyledQuote = styled(Blockquote, {
  margin: '0px',
  fontSize: '16px',
  fontFamily: '$inter',
  fontWeight: '500',
  lineHeight: '1.50',
  color: '$thHighContrast',
  paddingLeft: '15px',
  borderLeft: '2px solid $omnivoreCtaYellow',
})

export function HighlightItem(props: HighlightItemProps): JSX.Element {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )

  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )
  const [, updateState] = useState({})

  return (
    <>
      <HStack
        css={{ width: '100%', py: '20px', cursor: 'pointer' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VStack
          css={{
            gap: '10px',
            height: '100%',
            width: '100%',

            wordBreak: 'break-word',
            overflow: 'clip',
          }}
          alignment="start"
          distribution="start"
        >
          <StyledQuote
            onClick={(event) => {
              if (router && props.viewer) {
                const dest = `/${props.viewer}/${props.item.slug}#${props.highlight.id}`
                router.push(dest)
              }
              event.preventDefault()
            }}
          >
            <SpanBox css={{ p: '1px', borderRadius: '2px' }}>
              {lines.map((line: string, index: number) => (
                <Fragment key={index}>
                  {line}
                  {index !== lines.length - 1 && (
                    <>
                      <br />
                      <br />
                    </>
                  )}
                </Fragment>
              ))}
            </SpanBox>
          </StyledQuote>

          <Box css={{ display: 'block' }}>
            {props.highlight.labels?.map((label: Label, index: number) => (
              <LabelChip
                key={index}
                text={label.name || ''}
                color={label.color}
              />
            ))}
          </Box>

          {!isEditing && (
            <StyledText
              css={{
                borderRadius: '6px',
                bg: '#EBEBEB',
                p: '10px',
                width: '100%',
                marginTop: '5px',
                color: '#3D3D3D',
              }}
              onClick={() => setIsEditing(true)}
            >
              {props.highlight.annotation
                ? props.highlight.annotation
                : 'Add your notes...'}
            </StyledText>
          )}
          {isEditing && (
            <HighlightNoteTextEditArea
              setIsEditing={setIsEditing}
              highlight={props.highlight}
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              updateHighlight={() => {}}
            />
          )}
        </VStack>
        <SpanBox
          css={{
            marginLeft: 'auto',
            width: '20px',
            visibility: hover ? 'unset' : 'hidden',
            '@media (hover: none)': {
              visibility: 'unset',
            },
          }}
        >
          <HighlightsMenu
            highlight={props.highlight}
            setLabelsTarget={setLabelsTarget}
            setShowConfirmDeleteHighlightId={setShowConfirmDeleteHighlightId}
          />
        </SpanBox>
      </HStack>
      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={async () => {
            setShowConfirmDeleteHighlightId(undefined)
            const result = await deleteHighlightMutation(
              showConfirmDeleteHighlightId
            )
            if (result) {
              showSuccessToast('Highlight deleted')
            } else {
              showErrorToast('Error deleting highlight')
            }
          }}
          onOpenChange={() => setShowConfirmDeleteHighlightId(undefined)}
        />
      )}
      {labelsTarget && (
        <SetLabelsModal
          provider={labelsTarget}
          onOpenChange={function (open: boolean): void {
            setLabelsTarget(undefined)
          }}
          onLabelsUpdated={function (labels: Label[]): void {
            updateState({})
          }}
          save={function (labels: Label[]): Promise<Label[] | undefined> {
            const result = setLabelsForHighlight(
              labelsTarget.id,
              labels.map((label) => label.id)
            )
            return result
          }}
        />
      )}
    </>
  )
}

type HighlightsMenuProps = {
  highlight: Highlight

  setLabelsTarget: (target: Highlight) => void
  setShowConfirmDeleteHighlightId: (set: string) => void
}

function HighlightsMenu(props: HighlightsMenuProps): JSX.Element {
  const copyHighlight = useCallback(() => {
    ;(async () => {
      await navigator.clipboard.writeText(props.highlight.quote)
      showSuccessToast('Highlight copied')
    })()
  }, [props.highlight])

  const exportHighlight = useCallback(() => {
    ;(async () => {
      const markdown = highlightAsMarkdown(props.highlight)
      await navigator.clipboard.writeText(markdown)
      showSuccessToast('Highlight copied')
    })()
  }, [props.highlight])

  return (
    <Dropdown
      triggerElement={
        <Box
          css={{
            display: 'flex',
            height: '20px',
            width: '20px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1000px',
            '&:hover': {
              bg: '#898989',
            },
          }}
        >
          <DotsThreeVertical size={20} color="#EBEBEB" weight="bold" />
        </Box>
      }
    >
      <DropdownOption
        onSelect={async () => {
          copyHighlight()
        }}
        title="Copy"
      />
      <DropdownOption
        onSelect={() => {
          props.setLabelsTarget(props.highlight)
        }}
        title="Labels"
      />
      <DropdownOption
        onSelect={() => {
          exportHighlight()
        }}
        title="Delete"
      />
    </Dropdown>
  )
}

export function highlightAsMarkdown(highlight: Highlight) {
  let buffer = `> ${highlight.quote}`
  if (highlight.annotation) {
    buffer += `\n\n${highlight.annotation}`
  }
  buffer += '\n'
  return buffer
}

export function highlightsAsMarkdown(highlights: Highlight[]) {
  return highlights
    .map((highlight) => {
      return highlightAsMarkdown(highlight)
    })
    .join('\n\n')
}
