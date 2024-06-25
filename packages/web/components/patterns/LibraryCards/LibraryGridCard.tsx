import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useState } from 'react'
import {
  AuthorInfoStyle,
  CardCheckbox,
  LibraryItemMetadata,
  MetaStyle,
  siteName,
  TitleStyle,
  MenuStyle,
  FLAIR_ICON_NAMES,
} from './LibraryCardStyles'
import { sortedLabels } from '../../../lib/labelsSort'
import { LibraryHoverActions } from './LibraryHoverActions'
import {
  useHover,
  useFloating,
  useInteractions,
  size,
  offset,
  autoUpdate,
} from '@floating-ui/react'
import { CardMenu } from '../CardMenu'
import { DotsThree } from '@phosphor-icons/react'
import { isTouchScreenDevice } from '../../../lib/deviceType'
import { LoadingBarOverlay, ProgressBarOverlay } from './LibraryListCard'
import { GridFallbackImage } from './FallbackImage'
import { useRouter } from 'next/router'

dayjs.extend(relativeTime)

export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
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
        pl: '0px',
        padding: '0px',
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        minHeight: '270px',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'none',
        overflow: 'hidden',
        cursor: 'pointer',
        border: props.legacyLayout
          ? 'unset'
          : '1px solid $thLeftMenuBackground',
        '@media (max-width: 930px)': {
          width: 'calc(100% - 30px)',
        },
        '@mdDown': {
          width: '100%',
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
      onClick={(event) => {
        if (props.multiSelectMode !== 'off') {
          props.setIsChecked(props.item.id, !props.isChecked)
          return
        }
        window.localStorage.setItem('nav-return', router.asPath)
        if (event.metaKey || event.ctrlKey) {
          window.open(
            `/${props.viewer.profile.username}/${props.item.slug}`,
            '_blank'
          )
        } else {
          router.push(`/${props.viewer.profile.username}/${props.item.slug}`)
        }
      }}
    >
      {!isTouchScreenDevice() && props.multiSelectMode == 'off' && (
        <Box
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: 3 }}
          {...getFloatingProps()}
        >
          <LibraryHoverActions
            item={props.item}
            viewer={props.viewer}
            handleAction={props.handleAction}
            isHovered={isHovered ?? false}
          />
        </Box>
      )}
      {/* <Link
        href={`${props.viewer.profile.username}/${props.item.slug}`}
        passHref
      >
        <a
          href={`${props.viewer.profile.username}/${props.item.slug}`}
          style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
          tabIndex={-1}
        > */}
      <LibraryGridCardContent {...props} isHovered={isHovered} />
      {/* </a>
      </Link> */}
    </VStack>
  )
}

type GridImageProps = {
  src?: string
  title?: string
  readingProgress?: number
  isLoading?: boolean
}

const GridImage = (props: GridImageProps): JSX.Element => {
  const [displayFallback, setDisplayFallback] = useState(props.src == undefined)

  return (
    <>
      {props.isLoading && (
        <LoadingBarOverlay
          width="100%"
          top={145}
          bottomRadius={'0px'}
          fillColor={'rgba(60, 179, 113, 1)'}
        />
      )}
      {(props.readingProgress ?? 0) > 0 && !props.isLoading && (
        <ProgressBarOverlay
          width="100%"
          top={145}
          value={props.readingProgress ?? 0}
          bottomRadius={'0px'}
        />
      )}
      {displayFallback ? (
        <GridFallbackImage
          title={props.title ?? 'Omnivore Fallback'}
          width="100%"
          height="150px"
          fontSize="16px"
        />
      ) : (
        <CoverImage
          src={props.src}
          width="100%"
          height="150px"
          css={{
            bg: '$thBackground',
          }}
          onError={(e) => {
            setDisplayFallback(true)
          }}
        />
      )}
    </>
  )
}

const LibraryGridCardContent = (props: LinkedItemCardProps): JSX.Element => {
  const { isChecked, setIsChecked, item } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const originText = siteName(
    props.item.originalArticleUrl,
    props.item.url,
    props.item.siteName
  )

  const handleCheckChanged = useCallback(() => {
    const newValue = !isChecked
    setIsChecked(item.id, newValue)
  }, [item, setIsChecked, isChecked, props])

  return (
    <VStack css={{ p: '0px', m: '0px', width: '100%' }}>
      <Box css={{ position: 'relative', width: '100%', height: '150px' }}>
        <GridImage
          src={props.item.image}
          title={props.item.title}
          readingProgress={item.readingProgressPercent}
          isLoading={props.isLoading}
        />
        <SpanBox
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
            m: '12px',
            lineHeight: '1',
          }}
        >
          <CardCheckbox
            isChecked={isChecked}
            handleChanged={handleCheckChanged}
          />
        </SpanBox>
        <Box
          css={{
            ...MenuStyle,
            position: 'absolute',
            top: 0,
            right: 0,
            m: '5px',
            visibility: menuOpen ? 'visible' : 'hidden',
            '@media (hover: none)': {
              visibility: 'unset',
            },
          }}
        >
          <CardMenu
            item={props.item}
            viewer={props.viewer}
            onOpenChange={(open) => setMenuOpen(open)}
            actionHandler={props.handleAction}
            triggerElement={
              <DotsThree size={25} weight="bold" color="#ADADAD" />
            }
          />
        </Box>
      </Box>

      <HStack
        css={{
          ...MetaStyle,
          mt: '15px',
          px: '15px',
        }}
        distribution="start"
      >
        <LibraryItemMetadata item={props.item} showProgress={true} />
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
            ...AuthorInfoStyle,
            mt: '5px',
            mb: '15px',
          }}
        >
          {props.item.author}
          {props.item.author && originText && ' | '}
          {originText}
        </SpanBox>

        <HStack
          distribution="start"
          alignment="start"
          css={{ width: '100%', minHeight: '50px', pb: '15px' }}
        >
          <HStack
            css={{
              display: 'block',
              minHeight: '35px',
              marginLeft: '-4px', // offset because the chips have margin
            }}
          >
            {sortedLabels(props.item.labels)
              .filter(
                ({ name }) =>
                  FLAIR_ICON_NAMES.indexOf(name.toLocaleLowerCase()) == -1
              )
              .map(({ name, color }, index) => (
                <LabelChip key={index} text={name || ''} color={color} />
              ))}
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  )
}
