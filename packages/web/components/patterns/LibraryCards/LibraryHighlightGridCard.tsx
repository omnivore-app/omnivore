import { Box, VStack, HStack } from '../../elements/LayoutPrimitives'
import { useState } from 'react'
import { CaretDown, CaretUp } from 'phosphor-react'
import { MetaStyle, timeAgo, TitleStyle } from './LibraryCardStyles'
import { styled } from '@stitches/react'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { Button } from '../../elements/Button'
import { theme } from '../../tokens/stitches.config'
import { HighlightItem } from '../../templates/homeFeed/HighlightItem'

export const GridSeparator = styled(Box, {
  height: '1px',
  marginTop: '15px',
  backgroundColor: '$thBorderColor',
})

type LibraryHighlightGridCardProps = {
  viewer: UserBasicData
  item: LibraryItemNode
}

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
                <HighlightItem
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
