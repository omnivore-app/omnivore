import {
  Box,
  HStack,
  VStack,
  MediumBreakpointBox,
} from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { authoredByText } from '../ArticleSubtitle'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { theme } from '../../tokens/stitches.config'
import { CardMenu } from '../CardMenu'
import type { LinkedItemCardProps } from './CardTypes'
import { ProgressBar } from '../../elements/ProgressBar'

export function ListLinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  return (
    <MediumBreakpointBox
      smallerLayoutNode={<ListLinkedItemCardNarrow {...props} />}
      largerLayoutNode={<ListLinkedItemCardWide {...props} />}
    />
  )
}

export function ListLinkedItemCardNarrow(
  props: LinkedItemCardProps
): JSX.Element {
  return (
    <Box
      css={{
        p: '$3',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        cursor: 'pointer',
        wordBreak: 'break-word',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        alignItems: 'center',
        display: 'grid',
        gridTemplateColumns: '1fr 24px',
        gridTemplateRows: '1fr',
      }}
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <HStack
        distribution="start"
        alignment="end"
        css={{
          px: '$2',
          pl: '0px',
        }}
      >
        <VStack>
          <StyledText
            style="listTitle"
            data-testid="listTitle"
            css={{
              mt: '0px',
              mb: '$1',
              textAlign: 'left',
              lineHeight: 'normal',
            }}
          >
            {props.item.title}
          </StyledText>
          <HStack>
            {props.item.author && (
              <StyledText style="caption" css={{ my: '$1' }}>
                {authoredByText(props.item.author)}
              </StyledText>
            )}
            <StyledText
              style="caption"
              css={{
                my: '$1',
                ml: props.item.author ? '8px' : 0,
                textDecorationLine: 'underline',
              }}
            >
              {props.originText}
            </StyledText>
          </HStack>
        </VStack>
      </HStack>
      <Box
        css={{
          alignSelf: 'end',
          alignItems: 'center',
          display: 'grid',
          placeItems: 'center',
        }}
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
    </Box>
  )
}

export function ListLinkedItemCardWide(
  props: LinkedItemCardProps
): JSX.Element {
  return (
    <HStack
      css={{
        p: '$3',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 0,
        cursor: 'pointer',
        wordBreak: 'break-word',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        alignItems: 'center',
      }}
      onClick={() => {
        props.handleAction('showDetail')
      }}
    >
      <HStack
        distribution="start"
        alignment="end"
        css={{
          px: '$2',
          flexGrow: 1,
          pl: '0px',
        }}
      >
        <StyledText
          style="listTitle"
          data-testid="listTitle"
          css={{ mt: '0px', mb: '$1', textAlign: 'left', lineHeight: 'normal' }}
        >
          {props.item.title}
        </StyledText>
        {props.item.author && (
          <StyledText style="caption" css={{ my: '$1', ml: '8px' }}>
            {authoredByText(props.item.author)}
          </StyledText>
        )}
        <StyledText
          style="caption"
          css={{ my: '$1', ml: '8px', textDecorationLine: 'underline' }}
        >
          {props.originText}
        </StyledText>
      </HStack>
      <Box
        css={{
          width: '40px',
          height: '8px',
          mr: '$2',
          backgroundColor: '$grayBase',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '6px',
          border: '1px solid $grayBorder',
          px: '1px',
        }}
      >
        <ProgressBar
          fillPercentage={props.item.readingProgressPercent}
          fillColor={theme.colors.highlight.toString()}
          backgroundColor={theme.colors.grayTextContrast.toString()}
          borderRadius={'8px'}
        />
      </Box>
      <Box
        css={{
          alignSelf: 'end',
          alignItems: 'center',
          display: 'grid',
          placeItems: 'center',
        }}
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
  )
}
