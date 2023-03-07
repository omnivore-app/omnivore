import dayjs from 'dayjs'
import { DotsThreeVertical, HighlighterCircle } from 'phosphor-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { SideBarIcon } from '../../elements/images/SideBarIcon'
import { LabelChip } from '../../elements/LabelChip'
import {
  Blockquote,
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { MetaStyle } from '../../patterns/LibraryCards/LibraryCardStyles'
import { styled, theme } from '../../tokens/stitches.config'
import { TextEditArea } from '../article/NotebookModal'

type HighlightItemsLayoutProps = {
  items: LibraryItem[]
  viewer: UserBasicData | undefined

  gridContainerRef: React.RefObject<HTMLDivElement>
}

export function HighlightItemsLayout(
  props: HighlightItemsLayoutProps
): JSX.Element {
  const [currentItem, setCurrentItem] = useState<LibraryItem | undefined>(
    undefined
  )

  useEffect(() => {
    if (!currentItem && props.items.length > 0) {
      setCurrentItem(props.items[0])
    }
  }, [currentItem, setCurrentItem, props.items])

  return (
    <HStack
      css={{
        width: '100%',
        height: '100%',
        bg: '#333333',
      }}
      distribution="start"
      alignment="start"
    >
      <VStack
        css={{
          width: '430px',
          height: '100%',
          bg: '#2A2A2A',
          overflowY: 'scroll',
        }}
        distribution="start"
        alignment="start"
      >
        <HStack
          css={{
            width: 'calc(100% - 35px)',
            height: '55px',
            mx: '20px',
            borderBottom: '1px solid $thBorderColor',
          }}
          alignment="center"
          distribution="start"
        >
          <SideBarIcon strokeColor={theme.colors.thTextContrast.toString()} />
        </HStack>
        {props.items.map((linkedItem) => (
          <Box
            className="linkedItemCard"
            data-testid="linkedItemCard"
            id={linkedItem.node.id}
            tabIndex={0}
            key={linkedItem.node.id}
            css={{
              width: '100%',
              height: '100%',
              px: '15px',
            }}
            onClick={(event) => {
              setCurrentItem(linkedItem)
              event.preventDefault()
            }}
          >
            {props.viewer && (
              <HighlightTitleCard
                item={linkedItem}
                viewer={props.viewer}
                selected={currentItem?.node.id == linkedItem.node.id}
              />
            )}
          </Box>
        ))}
      </VStack>
      {currentItem && (
        <HighlightItemsCard item={currentItem} viewer={props.viewer} />
      )}
    </HStack>
  )
}

type HighlightTitleCardProps = {
  item: LibraryItem
  viewer: UserBasicData
  selected: boolean
}

const timeAgo = (date: string | undefined): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).fromNow()
}

function HighlightTitleCard(props: HighlightTitleCardProps): JSX.Element {
  return (
    <HStack
      css={{
        height: '100%',
        width: '100%',
        py: '10px',

        borderBottom: '1px solid $thBorderColor',
      }}
      distribution="start"
    >
      <HStack
        css={{
          width: '100%',
          height: '100%',
          py: '15px',
          px: '15px',
          borderRadius: '10px',
          bg: props.selected ? '#3D3D3D' : 'unset',
        }}
      >
        <VStack
          css={{
            width: '100%',
            height: '100%',

            borderRadius: '5px',
          }}
        >
          <HStack css={MetaStyle} distribution="start">
            <Box>
              {timeAgo(props.item.node.savedAt)}
              {` `}
              {props.item.node.wordsCount ?? 0 > 0
                ? `  • ${Math.max(
                    1,
                    Math.round((props.item.node.wordsCount ?? 0) / 235)
                  )} min read`
                : null}
              {props.item.node.readingProgressPercent ?? 0 > 0 ? (
                <>
                  {`  • `}
                  <SpanBox css={{ color: '#55B938' }}>
                    {`${Math.round(props.item.node.readingProgressPercent)}%`}
                  </SpanBox>
                </>
              ) : null}
            </Box>
          </HStack>
          <Box
            css={{
              mt: '5px',
              color: '$thTextContrast2',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '1.50',
              fontFamily: '$display',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {props.item.node.title}
          </Box>
        </VStack>

        <HighlightCountChip
          selected={props.selected}
          count={props.item.node.highlights?.length ?? 0}
        />
      </HStack>
    </HStack>
  )
}

type HighlightCountChipProps = {
  count: number
  selected: boolean
}

function HighlightCountChip(props: HighlightCountChipProps): JSX.Element {
  return (
    <HStack
      css={{
        gap: '5px',
        borderRadius: '12px',
        marginLeft: 'auto',
        minWidth: '50px',
        minHeight: '25px',
        width: '47px',
        color: props.selected ? '#3D3D3D' : '#898989',
        bg: props.selected ? '#D9D9D9' : '#3D3D3D',
        fontFamily: '$inter',
        fontSize: '14px',
        fontWeight: '500',
        ml: '30px',
      }}
      alignment="center"
      distribution="center"
    >
      {props.count}
      <HighlighterCircle
        size={15}
        color={props.selected ? '#3D3D3D' : '#898989'}
      />
    </HStack>
  )
}

type HighlightItemsCardProps = {
  item: LibraryItem
  viewer: UserBasicData | undefined
}

function HighlightItemsCard(props: HighlightItemsCardProps): JSX.Element {
  return (
    <HStack
      css={{ height: '100%', flexGrow: '1' }}
      distribution="center"
      alignment="start"
    >
      <VStack
        css={{
          width: '425px',
          height: '100%',
          // mt: '20px',
          //border: '1px solid $thBorderColor',
          borderRadius: '6px',
          // bg: '#2A2A2A',
        }}
        alignment="start"
        distribution="start"
      >
        <HStack
          css={{
            width: '100%',
            height: '100%',
            pt: '25px',
            borderBottom: '1px solid $thBorderColor',
          }}
          alignment="start"
          distribution="start"
        >
          <StyledText
            css={{
              fontWeight: '600',
              fontSize: '15px',
              fontFamily: '$display',
            }}
          >
            HIGHLIGHTS
          </StyledText>
        </HStack>
        <VStack css={{ height: '100%', width: '100%' }} distribution="start">
          {(props.item.node.highlights ?? []).map((highlight) => (
            <HighlightItemCard key={highlight.id} highlight={highlight} />
          ))}
        </VStack>
      </VStack>
    </HStack>
  )
}

const StyledQuote = styled(Blockquote, {
  margin: '0px 0px 0px 0px',
  fontSize: '16px',
  lineHeight: '1.50',
  color: '#D9D9D9',
  paddingLeft: '15px',
  borderLeft: '2px solid $omnivoreCtaYellow',
})

type HighlightItemCardProps = {
  highlight: Highlight
}

function HighlightItemCard(props: HighlightItemCardProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [hover, setHover] = useState(false)

  const lines = useMemo(
    () => props.highlight.quote.split('\n'),
    [props.highlight.quote]
  )

  console.log('hover: ', hover)

  return (
    <HStack
      css={{ width: '100%', py: '20px' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VStack
        css={{
          gap: '10px',
          height: '100%',

          cursor: 'pointer',
          wordBreak: 'break-word',
          overflow: 'clip',
        }}
        alignment="start"
        distribution="start"
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
            bg: '#3D3D3D',
            p: '10px',
            width: '100%',
            marginTop: '5px',
            color: '$grayText',
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
        <DotsThreeVertical size={20} color="#EBEBEB" weight="bold" />
      </SpanBox>
    </HStack>
  )
}
