import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { CoverImage } from '../../elements/CoverImage'
import { StyledText } from '../../elements/StyledText'
import { authoredByText } from '../ArticleSubtitle'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { theme } from '../../tokens/stitches.config'
import { CardMenu } from '../CardMenu'
import { LabelChip } from '../../elements/LabelChip'
import { ProgressBar } from '../../elements/ProgressBar'
import type { LinkedItemCardProps } from './CardTypes'

export function GridLinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  return (
    <VStack
      css={{
        p: '$2',
        pr: '8px',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: '6px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        overflow: 'clip',
        border: '1px solid $grayBorder',
        boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
        position: 'relative',
      }}
      alignment="start"
      distribution="start"
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <Box
        css={{
          position: 'absolute',
          top: '1px',
          left: '1px',
          width: 'calc(100% - 2px)',
          '& > div': {
            borderRadius: '100vmax 100vmax 0 0',
          },
        }}
      >
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor="transparent"
          borderRadius={
            props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
          }
        />
      </Box>
      <VStack
        distribution="start"
        alignment="start"
        css={{
          px: '0px',
          width: '100%',
          pl: '$1',
        }}
      >
        <HStack
          alignment="start"
          distribution="between"
          css={{
            width: '100%',
            p: '0px',
            mr: '-12px',
            mt: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 24px',
            gridTemplateRows: '1fr',
          }}
        >
          <CardTitle title={props.item.title} />
          <Box
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
          </Box>
        </HStack>
        <HStack alignment="start" distribution="between">
          <StyledText style="caption" css={{ my: '0', mt: '-$2' }}>
            {props.item.author && (
              <SpanBox css={{ mr: '8px' }}>
                {authoredByText(props.item.author)}
              </SpanBox>
            )}
            <SpanBox css={{ textDecorationLine: 'underline' }}>
              {props.originText}
            </SpanBox>
          </StyledText>
        </HStack>
      </VStack>
      <HStack
        alignment="start"
        distribution="between"
        css={{
          width: '100%',
          pt: '$2',
          px: '$1',
          pr: '12px',
          mt: '7px',
          flexGrow: '1',
        }}
      >
        <StyledText
          css={{
            m: 0,
            py: '0px',
            mr: '$2',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$grayTextContrast',
            flexGrow: '4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
          data-testid="listDesc"
        >
          {props.item.description}
        </StyledText>
        {props.item.image && (
          <CoverImage
            src={props.item.image}
            alt="Link Preview Image"
            width={135}
            height={90}
            css={{ ml: '10px', mb: '8px', borderRadius: '3px' }}
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )}
      </HStack>
      <Box css={{ display: 'block', mt: '8px' }}>
        {props.item.labels?.map(({ name, color }, index) => (
          <LabelChip key={index} text={name || ''} color={color} />
        ))}
      </Box>
    </VStack>
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
        mt: '0',
        mb: '0',
        fontWeight: '700',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {props.title}
    </StyledText>
  )
}
