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
import { isTouchScreenDevice } from '../../../../lib/deviceType'
import { FallbackImage } from '../../../patterns/LibraryCards/FallbackImage'
import { CoverImage } from '../../../elements/CoverImage'
import {
  AuthorInfoStyle,
  MetaStyle,
  siteName,
  TitleStyle,
} from '../../../patterns/LibraryCards/LibraryCardStyles'
import { DiscoveryItemCardProps } from './DiscoveryItemCard'
import { DiscoveryItemMetadata } from './DiscoveryItemMetadata'
import { DiscoveryHoverActions } from './DiscoveryHoverActions'
import { CheckCircle, Circle } from 'phosphor-react'

export function DiscoveryGridCard(props: DiscoveryItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [savedId, setSavedId] = useState(props.item.savedId)
  const [savedUrl, setSavedUrl] = useState(props.item.savedLinkUrl)

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
        pl: '0px',
        padding: '0px',
        width: '320px',
        height: '100%',
        minHeight: '270px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        overflow: 'hidden',
        borderColor: '$thBorderColor',
        '@media (max-width: 930px)': {
          m: '15px',
          width: 'calc(100% - 30px)',
        },
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
      {!isTouchScreenDevice() && (
        <Box
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: 3 }}
          {...getFloatingProps()}
        >
          <DiscoveryHoverActions
            item={props.item}
            viewer={props.viewer}
            isHovered={isHovered ?? false}
            handleLinkSubmission={props.handleLinkSubmission}
            setSavedId={setSavedId}
            savedId={savedId}
            savedUrl={savedUrl}
            setSavedUrl={setSavedUrl}
          />
        </Box>
      )}
      <DiscoveryGridCardContent {...props} savedId={savedId} savedUrl={savedUrl} isHovered={isHovered} />
    </VStack>
  )
}

const DiscoveryGridCardContent = (
  props: DiscoveryItemCardProps & { savedId?: string; savedUrl?: string }
): JSX.Element => {
  const { item } = props

  const [displayFallback, setDisplayFallback] = useState(
    props.item.image == undefined
  )
  const originText = siteName(props.item.url, props.item.url)

  const goToUrl = () => {
    if (props.savedUrl) {
      window.location.href = `/article?url=${encodeURIComponent(
        props.savedUrl
      )}`
    }
  }

  return (
    <VStack css={{ p: '0px', m: '0px', width: '100%', cursor: props.savedId ? 'pointer' : 'default' }} onClick={goToUrl} >
      <Box css={{ position: 'relative', width: '100%', height: '150px' }}>
        <>
          <HStack
            css={{
              position: 'absolute',
              left: '5px',
              top: '5px',
              color: '$thTextContrast2',
              opacity: props.savedId ? 1 : 0.25,
            }}
          >
            <CheckCircle
              size={26}
              color="#669852"
              weight="fill"
              style={{ zIndex: 2 }}
            />
            <Circle
              size={26}
              color="white"
              weight="fill"
              style={{ position: 'absolute', zIndex: 1 }}
            />
          </HStack>
          {displayFallback ? (
            <FallbackImage
              title={item.title ?? 'Omnivore Fallback'}
              width="100%"
              height="150px"
              fontSize="128px"
            />
          ) : (
            <CoverImage
              src={props.item.image}
              width="100%"
              height="150px"
              css={{
                bg: '$thBackground',
                cursor: props.savedId ? 'pointer' : 'default'
              }}
              onError={(e) => {
                setDisplayFallback(true)
              }}
            />
          )}
        </>
      </Box>

      <HStack
        css={{
          ...MetaStyle,
          mt: '15px',
          px: '15px',
        }}
        distribution="start"
      >
        <DiscoveryItemMetadata item={props.item} />
      </HStack>

      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%', px: '15px' }}
      >
        <Box
          css={{
            ...TitleStyle,
            mt: '5px',
          }}
        >
          {props.item.title}
        </Box>
        <SpanBox
          css={{
            color: '$thTextSubtle2',
            fontSize: '12px',
            fontWeight: '400',
            maxLines: 3,
            height: '45px',
            lineHeight: 1.25,
            fontFamily: '$display',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            display: '-webkit-box',
            '-webkit-line-clamp': '3',
            '-webkit-box-orient': 'vertical',
            mt: '5px',
            mb: '15px',
          }}
        >
          {props.item.description}
        </SpanBox>
        <SpanBox
          css={{
            ...AuthorInfoStyle,
            mt: '5px',
          }}
        >
          {props.item.author}
          {props.item.author && originText && ' | '}
          {originText}
        </SpanBox>

        <HStack
          distribution="start"
          alignment="start"
          css={{ width: '100%', minHeight: '15px', pb: '15px' }}
        >
          <HStack
            css={{
              display: 'block',
              minHeight: '0px',
              marginLeft: '-4px', // offset because the chips have margin
            }}
          ></HStack>
        </HStack>
      </VStack>
    </VStack>
  )
}
