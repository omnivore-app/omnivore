import {
  Box,
  VStack,
  HStack,
  SpanBox,
  Blockquote,
} from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import { Fragment, useMemo, useState } from 'react'
import { CaretDown, CaretUp, DotsThreeVertical } from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'
import {
  AuthorInfoStyle,
  DescriptionStyle,
  MenuStyle,
  MetaStyle,
  timeAgo,
  TitleStyle,
} from './LibraryCardStyles'
import { Separator } from '../../elements/Separator'
import { styled } from '@stitches/react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { StyledText } from '../../elements/StyledText'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import {
  LibraryItem,
  LibraryItemNode,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useRouter } from 'next/router'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { Button } from '../../elements/Button'
import { theme } from '../../tokens/stitches.config'

export const GridSeparator = styled(Box, {
  height: '1px',
  marginTop: '15px',
  backgroundColor: '$thBorderColor',
})

type LibraryHighlightGridCardProps = {
  viewer: UserBasicData
  item: LibraryItemNode
}

// Component
export function LibraryHighlightGridCard(
  props: LibraryHighlightGridCardProps
): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const higlightCount = props.item.highlights?.length ?? 0

  return (
    <VStack
      css={{
        pl: '15px',
        padding: '15px',
        width: '100%',
        height: '100%',
        marginTop: '20px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$thBorderColor',
        cursor: 'pointer',
        bg: '$thBackground3',
      }}
      alignment="start"
      distribution="start"
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      {!expanded && (
        <HStack
          css={{
            ...MetaStyle,
            minHeight: '35px',
          }}
          distribution="start"
        >
          <Box>
            {timeAgo(props.item.savedAt)}
            {` `}
            {props.item.wordsCount ?? 0 > 0
              ? `  • ${Math.max(
                  1,
                  Math.round((props.item.wordsCount ?? 0) / 235)
                )} min read`
              : null}
            {props.item.highlights?.length ?? 0 > 0
              ? `  • ${props.item.highlights?.length} highlights`
              : null}
          </Box>
        </HStack>
      )}
      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%' }}
      >
        <Box
          css={{
            ...TitleStyle,
          }}
        >
          {props.item.title}
        </Box>
        {expanded && (
          <>
            <GridSeparator css={{ width: '100%' }} />
            <VStack
              css={{ height: '100%', width: '100%' }}
              distribution="start"
            >
              {(props.item.highlights ?? []).map((highlight) => (
                <HighlightItemCard
                  key={highlight.id}
                  viewer={props.viewer}
                  item={props.item}
                  highlight={highlight}
                />
              ))}
            </VStack>
          </>
        )}
        <Box css={{ width: '100%' }}>
          {!expanded ? (
            <Button
              css={{
                mt: '30px',
                display: 'flex',
                gap: '5px',
                px: '10px',
                py: '6px',
                fontSize: '11px',
                fontFamily: '$inter',
                fontWeight: '500',
                bg: '$thBackground2',
                color: '$thTextSubtle2',
                alignItems: 'center',
                border: '1px solid transparent',
              }}
              onClick={(event) => {
                setExpanded(true)
                event.preventDefault()
              }}
            >
              {`View ${higlightCount} highlight${higlightCount > 1 ? 's' : ''}`}
              <CaretDown
                size={10}
                weight="bold"
                color={theme.colors.thHighContrast.toString()}
              />
            </Button>
          ) : (
            <Button
              style="plainIcon"
              css={{
                width: '25px',
                height: '25px',
                bg: '$thBackground2',
                pt: '2px',
                borderRadius: '1000px',
              }}
              onClick={(event) => {
                setExpanded(false)
                event.preventDefault()
              }}
            >
              <CaretUp size={15} weight="bold" color="#EC6A5E" />
            </Button>
          )}
        </Box>
      </VStack>
    </VStack>
  )
}

type HighlightItemCardProps = {
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

function HighlightItemCard(props: HighlightItemCardProps): JSX.Element {
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
        </StyledQuote>

        <Box css={{ display: 'block', pt: '16px' }}>
          {props.highlight.labels?.map((label: Label, index: number) => (
            <LabelChip
              key={index}
              text={label.name || ''}
              color={label.color}
            />
          ))}
        </Box>

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
