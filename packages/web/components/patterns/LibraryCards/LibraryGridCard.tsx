import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'
import { DotsThree } from 'phosphor-react'

dayjs.extend(relativeTime)

//Styles
const ellipsisText = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  margin: 'auto 0',
  pr: '10px',
}

const cardTitleStyle = {
  ...ellipsisText,
  width: '100%',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'left',
}

// Props
type CardTitleProps = {
  title: string
}

// Functions
function CardTitle(props: CardTitleProps): JSX.Element {
  return (
    <StyledText style="listTitle" data-testid="listTitle" css={cardTitleStyle}>
      {props.title}
    </StyledText>
  )
}

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
      <HStack
        css={{
          width: '100%',
          color: '#ADADAD',
          fontSize: '9px',
          fontWeight: '400',
          fontFamily: 'SF Pro Display',
          height: '35px',
        }}
        distribution="evenly"
      >
        <Box>{timeAgo(props.item.savedAt)}</Box>
        {isHovered ? (
          <SpanBox css={{ marginLeft: 'auto', mt: '-5px' }}>
            <DotsThree size={25} color="#ADADAD" />
          </SpanBox>
        ) : (
          <Box
            css={{
              marginLeft: 'auto',
              color: '#C1C1C1',
              fontSize: '9px',
              fontWeight: '700',
              fontFamily: 'SF Pro Display',
            }}
          >
            15 min read
          </Box>
        )}
      </HStack>
      <HStack css={{ pt: '10px', height: '100%', width: '100%' }}>
        <VStack css={{ height: '100%' }}>
          <Box
            css={{
              color: 'rgba(61, 61, 61, 1)',
              fontSize: '18px',
              fontWeight: '700',
              lineHeight: '22.5px',
              fontFamily: 'SF Pro Display',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
              height: '45px',
            }}
          >
            {props.item.title}
          </Box>
          <Box
            css={{
              color: 'rgba(106, 105, 104, 1)',
              pt: '10px',
              fontSize: '11px',
              fontWeight: '400',
              lineHeight: '140%',
              fontFamily: 'Inter',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
              height: '40px',
            }}
          >
            {props.item.description}
          </Box>
          <HStack
            css={{
              pt: '10px',
              color: 'rgba(173, 173, 173, 1)',
              fontSize: '9px',
              fontWeight: '400',
              fontFamily: 'SF Pro Display',
            }}
          >
            <SpanBox
              css={{
                maxLines: '1',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '240px',
                overflow: 'hidden',
              }}
            >
              {props.item.author}
              {props.item.author && originText && ' | '}
              {originText}
            </SpanBox>
          </HStack>
          <SpanBox css={{ pt: '20px', pr: '10px', width: '100%' }}>
            <ProgressBar
              fillPercentage={props.item.readingProgressPercent}
              fillColor="#FFD234"
              backgroundColor="#EEEEEE"
              borderRadius="5px"
            />
          </SpanBox>

          <Box css={{ marginTop: 'auto', display: 'block', pt: '10px' }}>
            {props.item.labels?.map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
          </Box>
        </VStack>
        <VStack
          css={{
            width: '80px',
            height: '100%',
            marginLeft: 'auto',
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
  )
}

// // Component
// export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
//   return (
//     <StyledLink
//       onClick={() => {
//         props.handleAction('showDetail')
//       }}
//     >
//       <VStack
//         distribution="start"
//         alignment="start"
//         css={{
//           width: '100%',
//           p: '10px',
//           height: '100%',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           border: '1px solid $libraryActiveMenuItem',
//           mb: '15px',
//         }}
//       >
//         <HStack
//           alignment="start"
//           distribution="between"
//           css={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 24px',
//             gridTemplateRows: '1fr',
//             width: '100%',
//           }}
//         >
//           <CardTitle title={props.item.title} />
//           <Box
//             css={{ alignSelf: 'end', alignItems: 'end', height: '100%' }}
//             onClick={(e) => {
//               // This is here to prevent menu click events from bubbling
//               // up and causing us to "click" on the link item.
//               e.stopPropagation()
//             }}
//           >
//             <CardMenu
//               item={props.item}
//               viewer={props.viewer}
//               triggerElement={
//                 <MoreOptionsIcon
//                   size={24}
//                   strokeColor={theme.colors.grayTextContrast.toString()}
//                   orientation="horizontal"
//                 />
//               }
//               actionHandler={props.handleAction}
//             />
//           </Box>
//         </HStack>
//         <HStack alignment="start" distribution="between">
//           <StyledText style="caption" css={{ fontWeight: '600' }}>
//             {props.item.author && (
//               <SpanBox>{removeHTMLTags(props.item.author)}</SpanBox>
//             )}
//             {props.originText && (
//               <>
//                 <Box
//                   css={{
//                     height: '4px',
//                     width: '4px',
//                     borderRadius: '50%',
//                     display: 'inline-block',
//                     background: 'var(--colors-graySolid)',
//                   }}
//                 ></Box>
//                 <SpanBox css={{ color: 'var(--colors-graySolid)' }}>
//                   {props.originText}
//                 </SpanBox>
//               </>
//             )}
//           </StyledText>
//         </HStack>
//       </VStack>
//       <HStack
//         alignment="start"
//         distribution="between"
//         css={{
//           width: '100%',
//           pr: '12px',
//           flexGrow: '1',
//         }}
//       >
//         <StyledText
//           css={{
//             fontStyle: 'normal',
//             fontWeight: '400',
//             fontSize: '14px',
//           }}
//           data-testid="listDesc"
//         >
//           {props.item.description}
//         </StyledText>
//       </HStack>
//       <Box css={{ display: 'block', py: '12px' }}>
//         {props.item.labels?.map(({ name, color }, index) => (
//           <LabelChip key={index} text={name || ''} color={color} />
//         ))}
//       </Box>
//       <ProgressBar
//         fillPercentage={props.item.readingProgressPercent}
//         fillColor={theme.colors.highlight.toString()}
//         backgroundColor={theme.colors.lightBorder.toString()}
//         borderRadius={
//           props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
//         }
//       />
//       </VStack>
//     </StyledLink>
//   )
// }
