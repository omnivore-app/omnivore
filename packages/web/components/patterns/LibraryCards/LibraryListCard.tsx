import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { useCallback, useState } from 'react'
import {
  Archive,
  ArchiveBox,
  DotsThree,
  Note,
  Notebook,
  Tag,
  Trash,
  Tray,
} from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'
import {
  AuthorInfoStyle,
  CardCheckbox,
  LibraryItemMetadata,
  MenuStyle,
  MetaStyle,
  siteName,
  TitleStyle,
} from './LibraryCardStyles'
import { sortedLabels } from '../../../lib/labelsSort'
import { LIBRARY_LEFT_MENU_WIDTH } from '../../templates/homeFeed/LibraryFilterMenu'
import { Button } from '../../elements/Button'
import { theme } from '../../tokens/stitches.config'

export function LibraryListCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <VStack
      css={{
        px: '15px',
        py: '10px',
        height: '100%',
        cursor: 'pointer',
        gap: '10px',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        width: '100vw',
        '@media (min-width: 768px)': {
          width: `calc(100vw - ${LIBRARY_LEFT_MENU_WIDTH})`,
        },
        '@media (min-width: 930px)': {
          width: '640px',
        },
        '@media (min-width: 1280px)': {
          width: '1000px',
        },
        '@media (min-width: 1600px)': {
          width: '1340px',
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
      {props.inMultiSelect ? (
        <LibraryListCardContent {...props} isHovered={isHovered} />
      ) : (
        <Link
          href={`${props.viewer.profile.username}/${props.item.slug}`}
          passHref
        >
          <a
            href={`${props.viewer.profile.username}/${props.item.slug}`}
            style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
            tabIndex={-1}
          >
            <LibraryListCardContent {...props} isHovered={isHovered} />
          </a>
        </Link>
      )}
    </VStack>
  )
}

export function LibraryListCardContent(
  props: LinkedItemCardProps
): JSX.Element {
  const { isChecked, setIsChecked, item } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  const handleCheckChanged = useCallback(() => {
    setIsChecked(item.id, !isChecked)
  }, [isChecked, setIsChecked, item])

  return (
    <>
      <HStack css={MetaStyle} distribution="start">
        <LibraryItemMetadata item={props.item} showProgress={true} />
        {props.inMultiSelect ? (
          <SpanBox css={{ marginLeft: 'auto' }}>
            <CardCheckbox
              isChecked={props.isChecked}
              handleChanged={handleCheckChanged}
            />
          </SpanBox>
        ) : (
          <Box
            css={{
              ...MenuStyle,
              gap: '10px',
              px: '20px',
              visibility: props.isHovered || menuOpen ? 'unset' : 'hidden',
              '@media (hover: none)': {
                visibility: 'unset',
              },
            }}
          >
            <Button
              style="hoverActionIcon"
              onClick={(event) => {
                props.handleAction('open-notebook')
                event.preventDefault()
              }}
            >
              <Notebook
                size={19}
                color={theme.colors.thHighContrast.toString()}
              />
            </Button>
            <Button
              style="hoverActionIcon"
              onClick={(event) => {
                props.handleAction('set-labels')
                event.preventDefault()
              }}
            >
              <Tag size={18} color={theme.colors.thHighContrast.toString()} />
            </Button>
            <Button
              style="hoverActionIcon"
              onClick={(event) => {
                const action = props.item.isArchived ? 'unarchive' : 'archive'
                props.handleAction(action)
                event.preventDefault()
              }}
            >
              {props.item.isArchived ? (
                <Tray
                  size={18}
                  color={theme.colors.thHighContrast.toString()}
                />
              ) : (
                <ArchiveBox
                  size={18}
                  color={theme.colors.thHighContrast.toString()}
                />
              )}
            </Button>
            <Button
              style="hoverActionIcon"
              onClick={(event) => {
                props.handleAction('delete')
                event.preventDefault()
              }}
            >
              <Trash size={18} color={theme.colors.thHighContrast.toString()} />
            </Button>
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
        )}
      </HStack>
      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%' }}
      >
        <Box css={{ ...TitleStyle, width: '80%' }}>{props.item.title}</Box>
        <SpanBox
          css={{
            mt: '5px',
            ...AuthorInfoStyle,
          }}
        >
          {props.item.author}
          {props.item.author && originText && ' | '}
          <SpanBox css={{ textDecoration: 'underline' }}>{originText}</SpanBox>
        </SpanBox>

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
            {sortedLabels(props.item.labels).map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
          </HStack>
        </HStack>
      </VStack>
    </>
  )
}
