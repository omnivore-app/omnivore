import React, { useState } from 'react'
import {
  autoUpdate,
  offset,
  size,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../../elements/LayoutPrimitives'
import { LIBRARY_LEFT_MENU_WIDTH } from '../../navMenu/LibraryMenu'
import { isTouchScreenDevice } from '../../../../lib/deviceType'
import { ListFallbackImage } from '../../../patterns/LibraryCards/FallbackImage'
import { CoverImage } from '../../../elements/CoverImage'
import {
  AuthorInfoStyle,
  MetaStyle,
  siteName,
  TitleStyle,
} from '../../../patterns/LibraryCards/LibraryCardStyles'
import { CheckCircle, Circle } from '@phosphor-icons/react'
import {
  DiscoverItemCardProps,
  DiscoverItemSubCardProps,
} from './DiscoverItemCard'
import { DiscoverItemMetadata } from './DiscoverItemMetadata'
import { DiscoverHoverActions } from './DiscoverHoverActions'

export function DiscoverItemListCard(
  props: DiscoverItemSubCardProps
): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({
        mainAxis: -25,
      }),
      size(),
    ],
    placement: 'top-end',
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <VStack
      ref={refs.setReference}
      {...getReferenceProps()}
      css={{
        px: '20px',
        pl: '10px',
        py: '15px',
        height: '100%',
        cursor: 'pointer',
        gap: '10px',
        borderStyle: 'none',
        borderBottom: 'none',
        borderRadius: '6px',
        width: '100%',
        '@media (min-width: 768px)': {
          width: `calc(100vw - ${LIBRARY_LEFT_MENU_WIDTH})`,
        },
        '@media (min-width: 930px)': {
          width: '660px',
        },
        '@media (min-width: 1280px)': {
          width: '1000px',
        },
        '@media (min-width: 1600px)': {
          width: '1340px',
        },
        '@media (max-width: 930px)': {
          borderRadius: '0px',
        },
      }}
      alignment="start"
      distribution="start"
    >
      {!isTouchScreenDevice() && (
        <Box
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: 3 }}
          {...getFloatingProps()}
        >
          <DiscoverHoverActions
            item={props.item}
            viewer={props.viewer}
            isHovered={isOpen ?? false}
            handleLinkSubmission={props.handleLinkSubmission}
            setSavedId={props.setSavedId}
            savedId={props.savedId}
            savedUrl={props.savedUrl}
            setSavedUrl={props.setSavedUrl}
            deleteDiscoverItem={props.deleteDiscoverItem}
          />
        </Box>
      )}
      <DiscoverListCardContent
        {...props}
        savedId={props.savedId}
        isHovered={isOpen}
      />
    </VStack>
  )
}

export function DiscoverListCardContent(
  props: DiscoverItemCardProps & { savedId?: string; savedUrl?: string }
): JSX.Element {
  const originText = siteName(props.item.url, props.item.url)
  const [displayFallback, setDisplayFallback] = useState(
    props.item.image == undefined
  )

  const goToUrl = () => {
    if (props.savedUrl) {
      window.location.href = props.savedUrl
    }
  }

  return (
    <HStack
      css={{
        gap: '15px',
        width: '100%',
        cursor: props.savedId ? 'pointer' : 'default',
      }}
      onClick={goToUrl}
    >
      <Box css={{ position: 'relative', width: '55px' }}>
        <HStack
          css={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            color: '$thTextContrast2',
            opacity: props.savedId ? 1 : 0.25,
          }}
        >
          <CheckCircle
            size={15}
            color="#669852"
            weight="fill"
            style={{ zIndex: 2 }}
          />
          <Circle
            size={15}
            color="white"
            weight="fill"
            style={{ position: 'absolute', zIndex: 1 }}
          />
        </HStack>
        {displayFallback ? (
          <ListFallbackImage
            title={props.item.title ?? 'Omnivore Fallback'}
            width="55px"
            height="55px"
            fontSize="36pt"
          />
        ) : (
          <CoverImage
            src={props.item.image}
            width={55}
            height={55}
            css={{
              bg: '$thBackground',
              borderRadius: '4px',
            }}
            onError={(e) => {
              setDisplayFallback(true)
            }}
          />
        )}
      </Box>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          height: '100%',
          width: '100%',
          lineHeight: 1,
          gap: '3px',
          position: 'relative',
        }}
      >
        <HStack
          css={{
            ...MetaStyle,
          }}
          distribution="between"
        >
          <DiscoverItemMetadata item={props.item} />
          {(props.item.author?.length ?? 0 + originText.length) > 0 && (
            <HStack
              css={{
                ...AuthorInfoStyle,
                fontWeight: '100',
              }}
            >
              {props.item.author}
              {props.item.author && originText && ' | '}
              {originText}
            </HStack>
          )}
        </HStack>

        <Box css={{ ...TitleStyle }}>{props.item.title}</Box>

        <SpanBox
          css={{
            color: '$thTextSubtle2',
            fontSize: '12px',
            fontWeight: '400',
            maxLines: 2,
            height: '30px',
            lineHeight: 1.25,
            fontFamily: '$display',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
          }}
        >
          {props.item.description}
        </SpanBox>
      </VStack>
    </HStack>
  )
}
