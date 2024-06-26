import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
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
import { LIBRARY_LEFT_MENU_WIDTH } from '../../templates/navMenu/LibraryMenu'
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
import { CoverImage } from '../../elements/CoverImage'
import { ProgressBar } from '../../elements/ProgressBar'
import { theme } from '../../tokens/stitches.config'
import { ListFallbackImage } from './FallbackImage'
import { useRouter } from 'next/router'
import { LoadingBar } from '../../elements/LoadingBar'

export function LibraryListCard(props: LinkedItemCardProps): JSX.Element {
  const router = useRouter()
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

  const layoutWidths = props.legacyLayout
    ? {
        width: '100vw',
        '@media (min-width: 768px)': {
          width: `calc(100vw - ${LIBRARY_LEFT_MENU_WIDTH})`,
        },
        '@media (min-width: 930px)': {
          width: '580px',
        },
        '@media (min-width: 1280px)': {
          width: '890px',
        },
        '@media (min-width: 1600px)': {
          width: '1200px',
        },
      }
    : {
        width: '100%',
      }

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
        '@media (max-width: 930px)': {
          borderRadius: '0px',
        },
        ...layoutWidths,
      }}
      alignment="start"
      distribution="start"
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
            isHovered={isOpen ?? false}
          />
        </Box>
      )}
      <LibraryListCardContent {...props} isHovered={isOpen} />
    </VStack>
  )
}

type LoadingBarOverlayProps = {
  top: number
  width: string
  bottomRadius: string
  fillColor?: string
  percentFill?: number
}

type ProgressBarOverlayProps = {
  top: number
  width: string
  value: number
  bottomRadius: string
}

export const LoadingBarOverlay = (
  props: LoadingBarOverlayProps
): JSX.Element => {
  return (
    <Box
      css={{
        position: 'absolute',
        width: props.width,
        top: props.top,
        borderBottomLeftRadius: props.bottomRadius,
        borderBottomRightRadius: props.bottomRadius,
        overflow: 'clip',
        zIndex: 2,
      }}
    >
      <LoadingBar
        fillColor={props.fillColor ?? theme.colors.thProgressFg.toString()}
        backgroundColor="rgba(217, 217, 217, 0.65)"
        borderRadius={'2px'}
        percentFill={props.percentFill}
      />
    </Box>
  )
}

export const ProgressBarOverlay = (
  props: ProgressBarOverlayProps
): JSX.Element => {
  return (
    <Box
      css={{
        position: 'absolute',
        width: props.width,
        top: props.top,
        borderBottomLeftRadius: props.bottomRadius,
        borderBottomRightRadius: props.bottomRadius,
        overflow: 'clip',
        zIndex: 2,
      }}
    >
      <ProgressBar
        fillPercentage={props.value}
        fillColor={theme.colors.thProgressFg.toString()}
        backgroundColor="rgba(217, 217, 217, 0.65)"
        borderRadius={'2px'}
      />
    </Box>
  )
}

type ListImageProps = {
  src?: string
  title?: string
  readingProgress?: number
  isLoading?: boolean
}

const ListImage = (props: ListImageProps): JSX.Element => {
  const [displayFallback, setDisplayFallback] = useState(props.src == undefined)

  return (
    <>
      {props.isLoading && (
        <LoadingBarOverlay
          width="55px"
          top={50}
          bottomRadius="4px"
          fillColor={'rgba(60, 179, 113, 1)'}
          percentFill={30}
        />
      )}
      {(props.readingProgress ?? 0) > 0 && !props.isLoading && (
        <ProgressBarOverlay
          width="55px"
          top={50}
          bottomRadius="4px"
          value={props.readingProgress ?? 0}
        />
      )}
      {displayFallback ? (
        <ListFallbackImage
          title={props.title ?? 'Omnivore Fallback'}
          width="55px"
          height="55px"
          fontSize="16pt"
        />
      ) : (
        <CoverImage
          src={props.src}
          width={55}
          height={55}
          css={{
            bg: '$thBackground',
            borderRadius: '4px',
          }}
          onError={() => {
            setDisplayFallback(true)
          }}
        />
      )}
    </>
  )
}

export function LibraryListCardContent(
  props: LinkedItemCardProps
): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isChecked, setIsChecked, item } = props
  const originText = siteName(
    props.item.originalArticleUrl,
    props.item.url,
    props.item.siteName
  )

  const handleCheckChanged = useCallback(() => {
    setIsChecked(item.id, !isChecked)
  }, [isChecked, setIsChecked, item])

  return (
    <HStack css={{ gap: '15px', width: '100%' }}>
      <SpanBox
        css={{
          display: 'flex',
          m: '0px',
          mt: '0px',
          p: '0px',
          ml: '4px',
          lineHeight: '1',
          '> input': {
            p: '0px',
            m: '0px',
          },
        }}
      >
        <CardCheckbox
          isChecked={props.isChecked}
          handleChanged={handleCheckChanged}
        />
      </SpanBox>
      <Box css={{ position: 'relative', width: '55px' }}>
        <ListImage
          src={props.item.image}
          title={props.item.title}
          readingProgress={item.readingProgressPercent}
          isLoading={props.isLoading}
        />
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
        <Box
          css={{
            ...MenuStyle,
            position: 'absolute',
            top: -10,
            right: -10,
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
        <HStack
          css={{
            ...MetaStyle,
          }}
          distribution="start"
        >
          <LibraryItemMetadata item={props.item} showProgress={true} />
        </HStack>

        <Box css={{ ...TitleStyle }}>{props.item.title}</Box>
        {(props.item.author?.length ?? 0 + originText.length) > 0 && (
          <SpanBox
            css={{
              ...AuthorInfoStyle,
            }}
          >
            {props.item.author}
            {props.item.author && originText && ' | '}
            {originText}
          </SpanBox>
        )}

        <HStack
          distribution="start"
          alignment="start"
          // The two pixels here are to account for the label margin
          css={{ width: '100%', ml: '-2px', mt: '5px' }}
        >
          <HStack
            css={{
              display: 'block',
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
    </HStack>
  )
}
