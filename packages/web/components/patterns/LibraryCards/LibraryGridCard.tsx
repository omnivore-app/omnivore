import { VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { removeHTMLTags } from '../ArticleSubtitle'
import { theme } from '../../tokens/stitches.config'
import { LabelChip } from '../../elements/LabelChip'
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
    <VStack
      distribution="start"
      alignment="start"
      css={{
        width: '100%',
      }}
    >
      <HStack
        alignment="start"
        distribution="between"
        css={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '0.01fr 1fr 2fr 150px',
          gridTemplateRows: '1fr',
          borderBottom: '1px solid $graySeparator',
          height: '45px',
        }}
      >
        <ProgressBarVertical
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayProgressBackground.toString()}
          borderRadius={
            props.item.readingProgressPercent === 100 ? '0' : '0px 8px 8px 0px'
          }
          height={'45px'}
        />
        <CardTitle title={props.item.title} />
        <StyledText
          css={{
            ...ellipsisText,
            color: '$grayTextContrast',
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
      </HStack>
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
        ...ellipsisText,
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'left',
      }}
    >
      {props.title}
    </StyledText>
  )
}
