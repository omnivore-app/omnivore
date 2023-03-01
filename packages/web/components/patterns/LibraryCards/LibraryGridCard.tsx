import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'
import { DotsThreeVertical } from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'

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
export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const originText =
    props.item.siteName ||
    siteName(props.item.originalArticleUrl, props.item.url)

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
        borderColor: '#E1E1E1',
        cursor: 'pointer',
      }}
      alignment="start"
      distribution="start"
      onMouseEnter={() => {
        const element = document.getElementById(props.item.id)
        if (!element) {
          return
        }
        element.focus()
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
              color: '#6A6968',
              fontSize: '13px',
              fontWeight: '400',
              fontFamily: 'SF Pro Display',
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
            </Box>
            <Box
              css={{
                display: 'flex',
                visibility: isHovered ? 'unset' : 'hidden',
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
                color: 'rgba(61, 61, 61, 1)',
                fontSize: '20px',
                fontWeight: '700',
                lineHeight: '1.25',
                fontFamily: 'SF Pro Display',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                display: '-webkit-box',
                '-webkit-line-clamp': '2',
                '-webkit-box-orient': 'vertical',
                height: '50px',
              }}
            >
              {props.item.title}
            </Box>
            <Box
              css={{
                color: '#3D3D3D',
                pt: '10px',
                fontSize: '13px',
                fontWeight: '400',
                lineHeight: '140%',
                fontFamily: 'SF Pro Display',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                '-webkit-line-clamp': '2',
                '-webkit-box-orient': 'vertical',
                height: '45px',
                alignItems: 'start',
              }}
            >
              test{props.item.description}
            </Box>
            <HStack
              css={{
                pt: '10px',
                color: '#898989',
                fontSize: '13px',
                fontWeight: '400',
                fontFamily: 'SF Pro Display',
              }}
            >
              <SpanBox
                css={{
                  m: '0px',
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
                fillColor="#FFD234"
                backgroundColor="#EEEEEE"
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
                {props.item.labels?.map(({ name, color }, index) => (
                  <LabelChip key={index} text={name || ''} color={color} />
                ))}
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
