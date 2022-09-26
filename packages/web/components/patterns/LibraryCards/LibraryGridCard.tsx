import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
// import { CoverImage } from '../../elements/CoverImage'
import { StyledText } from '../../elements/StyledText'
import { removeHTMLTags } from '../ArticleSubtitle'
// import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { theme } from '../../tokens/stitches.config'
// import { CardMenu } from '../CardMenu'
import { LabelChip } from '../../elements/LabelChip'
// import { ProgressBar } from '../../elements/ProgressBar'
import type { LinkedItemCardProps } from './CardTypes'
import { ProgressBarVertical } from '../../elements/ProgressBarVertical'

//Styles
const ellipsisText = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  pl: '10px',
  margin: 'auto 0',
}

export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  return (
    <>
      {/* <VStack
      css={{
        // p: '12px',
        // height: '100%',
        // width: '100%',
        // maxWidth: '100%',
        borderRadius: '5px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        overflow: 'clip',
        border: '1px solid $libraryActiveMenuItem',
        position: 'relative',
      }}
      alignment="start"
      distribution="start"
      onClick={() => {
        props.handleAction('showDetail')
      }}
    > */}
      {/* {props.item.image && props.layout !== 'LIST_LAYOUT' && (
        <CoverImage
          src={props.item.image}
          alt="Link Preview Image"
          width="100%"
          height={160}
          css={{ borderRadius: '8px' }}
          onError={(e) => {
            ;(e.target as HTMLElement).style.display = 'none'
          }}
        />
      )} */}
      <VStack
        distribution="start"
        alignment="start"
        css={{
          // px: '0px',
          width: '100%',
          // pl: '$1',
        }}
      >
        {/* <ProgressBar
        fillPercentage={props.item.readingProgressPercent}
        fillColor={theme.colors.highlight.toString()}
        backgroundColor={theme.colors.lightBorder.toString()}
        borderRadius={
          props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
        }
      /> */}
        <HStack
          alignment="start"
          distribution="between"
          css={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '0.01fr 1fr 2fr 150px',
            gridTemplateRows: '1fr',
            borderBottom: '1px solid $graySolid',
            height: '45px',
          }}
        >
          <ProgressBarVertical
            fillPercentage={props.item.readingProgressPercent}
            fillColor={theme.colors.highlight.toString()}
            backgroundColor={theme.colors.lightBorder.toString()}
            borderRadius={
              props.item.readingProgressPercent === 100
                ? '0'
                : '0px 8px 8px 0px'
            }
            height={'45px'}
          />
          <CardTitle title={props.item.title} />
          <StyledText
            css={{
              ...ellipsisText,
              color: '$grayTextContrast',
              // overflow: 'hidden',
              // display: '-webkit-box',
              // WebkitLineClamp: 1,
              // WebkitBoxOrient: 'vertical',
            }}
            data-testid="listDesc"
          >
            {/* <Box css={{ display: 'block', py: '12px' }}> */}
            {props.item.labels?.map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
            {/* </Box> */}
            {props.item.description}
          </StyledText>

          <StyledText
            style="caption"
            css={{ ...ellipsisText, fontWeight: '400' }}
          >
            {props.item.author && (
              <SpanBox>{removeHTMLTags(props.item.author)}</SpanBox>
            )}
          </StyledText>

          {/* <Box
            css={{ alignSelf: 'end', alignItems: 'start', height: '100%' }}
            onClick={(e) => {
              // This is here to prevent menu click events from bubbling
              // up and causing us to "click" on the link item.
              e.stopPropagation()
            }}
          >
            <CardMenu
              item={props.item}
              viewer={props.viewer}
              triggerElement={
                <MoreOptionsIcon
                  size={24}
                  strokeColor={theme.colors.grayTextContrast.toString()}
                  orientation="horizontal"
                />
              }
              actionHandler={props.handleAction}
            />
          </Box> */}
        </HStack>
        {/* <ProgressBar
        fillPercentage={props.item.readingProgressPercent}
        fillColor={theme.colors.highlight.toString()}
        backgroundColor={theme.colors.lightBorder.toString()}
        borderRadius={
          props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
        }
      /> */}
        {/* <HStack alignment="start" distribution="between">
          <StyledText style="caption" css={{fontWeight: '600', margin: '5px 8px 5px 0' }}>
            {props.item.author && (
              <SpanBox>
                {removeHTMLTags(props.item.author)}
              </SpanBox>
            )}
            {props.originText && (
              <>
                <Box
                  css={{
                    height: '4px',
                    width: '4px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    background: 'var(--colors-graySolid)',
                    margin: '1px',
                  }}
                ></Box>
                <SpanBox css={{ color: 'var(--colors-graySolid)' }}>
                  {props.originText}
                </SpanBox>
              </>
            )}
          </StyledText>
        </HStack> */}
      </VStack>
      {/* <HStack
        alignment="start"
        distribution="between"
        css={{
          width: '100%',
          // pt: '$2',
          // px: '$1',
          pr: '12px',
          // mt: '7px',
          flexGrow: '1',
        }}
      ></HStack> */}
      {/* <Box css={{ display: 'block', py: '12px' }}>
        {props.item.labels?.map(({ name, color }, index) => (
          <LabelChip key={index} text={name || ''} color={color} />
        ))}
      </Box> */}

      {/* </VStack> */}
    </>
  )
}

type CardTitleProps = {
  title: string
}

function CardTitle(props: CardTitleProps): JSX.Element {
  return (
    <StyledText
      style="listTitle"
      data-testid="listTitle"
      css={{
        ...ellipsisText,
        fontSize: '18px',
        textAlign: 'left',
        // lineHeight: '1.25',
        //overflow: 'hidden',
        // display: '-webkit-box',
        // WebkitLineClamp: 1,
        // WebkitBoxOrient: 'vertical',
        // // p: '0 15px 0 0',
        // margin: 'auto',
      }}
    >
      {props.title}
    </StyledText>
  )
}
