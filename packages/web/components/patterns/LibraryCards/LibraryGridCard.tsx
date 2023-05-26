import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMemo, useState } from 'react'
import { DotsThreeVertical } from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'
import {
  AuthorInfoStyle,
  DescriptionStyle,
  LibraryItemMetadata,
  MenuStyle,
  MetaStyle,
  siteName,
  timeAgo,
  TitleStyle,
} from './LibraryCardStyles'
import { sortedLabels } from '../../../lib/labelsSort'

dayjs.extend(relativeTime)

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '4px',
        width: '100%',
        borderRadius: '$1',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
          borderRadius: props.borderRadius,
        }}
      />
    </Box>
  )
}

// Component
export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  return (
    <VStack
      css={{
        pl: '20px',
        padding: '15px',
        width: '320px',
        height: '100%',
        minHeight: '270px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$thBorderColor',
        cursor: 'pointer',
        '@smDown': {
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
      <Link
        href={`${props.viewer.profile.username}/${props.item.slug}`}
        passHref
      >
        <a
          href={`${props.viewer.profile.username}/${props.item.slug}`}
          style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
          tabIndex={-1}
        >
          <HStack
            css={{
              ...MetaStyle,
              minHeight: '35px',
            }}
            distribution="start"
          >
            <LibraryItemMetadata item={props.item} />
            <Box
              css={{
                ...MenuStyle,
                visibility: isHovered || menuOpen ? 'unset' : 'hidden',
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
                  <DotsThreeVertical size={25} weight="bold" color="#ADADAD" />
                }
              />
            </Box>
          </HStack>
          <VStack
            alignment="start"
            distribution="start"
            css={{ height: '100%', width: '100%' }}
          >
            <Box
              css={{
                ...TitleStyle,
                height: '42px',
              }}
            >
              {props.item.title}
            </Box>
            <Box css={DescriptionStyle}>{props.item.description}</Box>
            <SpanBox
              css={{
                ...AuthorInfoStyle,
                mt: '10px',
              }}
            >
              {props.item.author}
              {props.item.author && originText && ' | '}
              <SpanBox css={{ textDecoration: 'underline' }}>
                {originText}
              </SpanBox>
            </SpanBox>
            <SpanBox
              css={{
                pt: '20px',
                pr: '10px',
                pb: '20px',
                width: '100%',
                m: '0px',
              }}
            >
              <ProgressBar
                fillPercentage={props.item.readingProgressPercent}
                fillColor="$thProgressFg"
                backgroundColor="$thBorderSubtle"
                borderRadius="5px"
              />
            </SpanBox>

            <HStack
              distribution="start"
              alignment="start"
              css={{ width: '100%', minHeight: '50px' }}
            >
              <HStack
                css={{
                  display: 'block',
                  minHeight: '35px',
                }}
              >
                {sortedLabels(props.item.labels).map(
                  ({ name, color }, index) => (
                    <LabelChip key={index} text={name || ''} color={color} />
                  )
                )}
              </HStack>
              <VStack
                css={{
                  width: '80px',
                  height: '100%',
                  marginLeft: 'auto',
                  flexGrow: '1',
                }}
                alignment="end"
                distribution="end"
              >
                {props.item.image && (
                  <CoverImage
                    src={props.item.image}
                    alt="Link Preview Image"
                    width={50}
                    height={50}
                    css={{ borderRadius: '8px' }}
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                )}
              </VStack>
            </HStack>
          </VStack>
        </a>
      </Link>
    </VStack>
  )
}
