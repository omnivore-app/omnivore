import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import { DotsThreeVertical } from 'phosphor-react'
import { Fragment, useMemo, useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import {
  LibraryItem,
  LibraryItemNode,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { LabelChip } from '../../elements/LabelChip'
import {
  Blockquote,
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'

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

  return (
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
        onClick={(event) => {
          if (router && props.viewer) {
            const dest = `/${props.viewer}/${props.item.slug}#${props.highlight.id}`
            router.push(dest)
          }
          event.preventDefault()
        }}
      >
        <StyledQuote>
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
          <Box css={{ display: 'block', pt: '16px' }}>
            {props.highlight.labels?.map((label: Label, index: number) => (
              <LabelChip
                key={index}
                text={label.name || ''}
                color={label.color}
              />
            ))}
          </Box>
        </StyledQuote>

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
        <HighlightsMenu />
      </SpanBox>
    </HStack>
  )
}

function HighlightsMenu(): JSX.Element {
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
        onSelect={() => {
          console.log('copy')
        }}
        title="Copy"
      />
      <DropdownOption
        onSelect={() => {
          console.log('labels')
        }}
        title="Labels"
      />
      <DropdownOption
        onSelect={() => {
          console.log('delete')
        }}
        title="Delete"
      />
    </Dropdown>
  )
}
