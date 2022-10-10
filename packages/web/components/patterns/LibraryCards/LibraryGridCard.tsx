import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { removeHTMLTags } from '../ArticleSubtitle'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { theme } from '../../tokens/stitches.config'
import { CardMenu } from '../CardMenu'
import { LabelChip } from '../../elements/LabelChip'
import { ProgressBar } from '../../elements/ProgressBar'
import type { LinkedItemCardProps } from './CardTypes'
import { ProgressBarVertical } from '../../elements/ProgressBarVertical'

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

// Component
export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  return (
    <>
      {props.layout === 'GRID_LAYOUT' ? (
        <VStack
          css={{
            p: '12px',
            height: '100%',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid $libraryActiveMenuItem',
            mb: '15px',
          }}
          alignment="start"
          distribution="start"
          onClick={() => {
            props.handleAction('showDetail')
          }}
        >
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
                display: 'grid',
                gridTemplateColumns: '1fr 24px',
                gridTemplateRows: '1fr',
                width: '100%',
              }}
            >
              <CardTitle title={props.item.title} />
              <Box
                css={{ alignSelf: 'end', alignItems: 'end', height: '100%' }}
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
              <StyledText style="caption" css={{ fontWeight: '600' }}>
                {props.item.author && (
                  <SpanBox>{removeHTMLTags(props.item.author)}</SpanBox>
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
                      }}
                    ></Box>
                    <SpanBox css={{ color: 'var(--colors-graySolid)' }}>
                      {props.originText}
                    </SpanBox>
                  </>
                )}
              </StyledText>
            </HStack>
          </VStack>
          <HStack
            alignment="start"
            distribution="between"
            css={{
              width: '100%',
              pr: '12px',
              flexGrow: '1',
            }}
          >
            <StyledText
              css={{
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '14px',
              }}
              data-testid="listDesc"
            >
              {props.item.description}
            </StyledText>
          </HStack>
          <Box css={{ display: 'block', py: '12px' }}>
            {props.item.labels?.map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
          </Box>
          <ProgressBar
            fillPercentage={props.item.readingProgressPercent}
            fillColor={theme.colors.highlight.toString()}
            backgroundColor={theme.colors.lightBorder.toString()}
            borderRadius={
              props.item.readingProgressPercent === 100
                ? '0'
                : '0px 8px 8px 0px'
            }
          />
        </VStack>
      ) : (
        //  ELSE display List Layout
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
              }}
              data-testid="listDesc"
            >
              {props.item.labels?.map(({ name, color }, index) => (
                <LabelChip key={index} text={name || ''} color={color} />
              ))}
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
      )}
    </>
  )
}
