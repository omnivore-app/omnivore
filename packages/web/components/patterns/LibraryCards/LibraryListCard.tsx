import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'
import { DotsThree, DotsThreeVertical } from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'

dayjs.extend(relativeTime)

const timeAgo = (date: string | undefined): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).fromNow()
}

const shouldHideUrl = (url: string): boolean => {
  try {
    const origin = new URL(url).origin
    const hideHosts = ['https://storage.googleapis.com', 'https://omnivore.app']
    if (hideHosts.indexOf(origin) != -1) {
      return true
    }
  } catch {
    console.log('invalid url item', url)
  }
  return false
}

const siteName = (originalArticleUrl: string, itemUrl: string): string => {
  if (shouldHideUrl(originalArticleUrl)) {
    return ''
  }
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {}
  try {
    return new URL(itemUrl).hostname.replace(/^www\./, '')
  } catch {}
  return ''
}

// Component
export function LibraryListCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const originText =
    props.item.siteName ||
    siteName(props.item.originalArticleUrl, props.item.url)

  return (
    <VStack
      css={{
        p: '20px',
        // padding: '15px',
        width: '100%',
        height: '100%',
        // minHeight: '270px',
        // background: 'white',
        // borderWidth: '1px',
        // borderStyle: 'solid',
        // borderColor: '#E1E1E1',
        cursor: 'pointer',
        gap: '10px',

        // p: '20px',
        // height: '100%',
        // width: '100%',
        // maxWidth: '100%',
        // borderRadius: 0,
        // wordBreak: 'break-word',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        // alignItems: 'center',
        // display: 'grid',
        // gridTemplateColumns: '1fr 24px',
        // gridTemplateRows: '1fr',
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
        >
          <HStack
            css={{
              width: '100%',
              color: '$thTextSubtle2',
              fontSize: '10px',
              fontWeight: '500',
              fontFamily: '$display',
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
              {props.item.readingProgressPercent ?? 0 > 0 ? (
                <>
                  {`  • `}
                  <SpanBox css={{ color: '#55B938' }}>
                    {`${Math.round(props.item.readingProgressPercent)}%`}
                  </SpanBox>
                </>
              ) : null}
            </Box>
            <Box
              css={{
                display: 'flex',
                visibility: isHovered || menuOpen ? 'unset' : 'hidden',
                marginLeft: 'auto',
                height: '30px',
                width: '30px',
                mt: '-5px',
                mr: '-5px',
                pt: '2px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '1000px',
                '&:hover': {
                  bg: '#EBEBEB',
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
          </HStack>
          <VStack
            alignment="start"
            distribution="start"
            css={{ height: '100%', width: '100%' }}
          >
            <Box
              css={{
                color: '$thTextContrast2',
                fontSize: '16px',
                fontWeight: '700',
                lineHeight: '1.25',
                maxWidth: '1200px',
                fontFamily: '$display',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                display: '-webkit-box',
                '-webkit-line-clamp': '2',
                '-webkit-box-orient': 'vertical',
              }}
            >
              {props.item.title}
            </Box>
            <HStack
              css={{
                color: '$thTextSubtle3',
                fontSize: '11px',
                fontWeight: '400',
                fontFamily: '$display',
              }}
            >
              <SpanBox
                css={{
                  mt: '5px',
                  maxLines: '1',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '240px',
                  overflow: 'hidden',
                  height: '21px',
                }}
              >
                {props.item.author}
                {props.item.author && originText && ' | '}
                <SpanBox css={{ textDecoration: 'underline' }}>
                  {originText}
                </SpanBox>
              </SpanBox>
            </HStack>

            <HStack
              distribution="start"
              alignment="start"
              // The two pixels here are to account for the label margin
              css={{ width: '100%', ml: '-2px' }}
            >
              <HStack
                css={{
                  display: 'block',
                }}
              >
                {props.item.labels?.map(({ name, color }, index) => (
                  <LabelChip key={index} text={name || ''} color={color} />
                ))}
              </HStack>
            </HStack>
          </VStack>
        </a>
      </Link>
    </VStack>
  )
}
