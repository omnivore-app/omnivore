import { Box, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { ErrorSlothIcon } from '../../elements/icons/ErrorSlothIcon'
import { DEFAULT_HEADER_HEIGHT } from './HeaderSpacer'

export const FetchItemsError = (): JSX.Element => {
  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        gap: '5px',
        width: '100%',
        height: '100%',
        pb: '100px',
        px: '30px',
        minHeight: `calc(100vh - ${DEFAULT_HEADER_HEIGHT})`,
      }}
    >
      <ErrorSlothIcon />
      <StyledText
        css={{
          display: 'flex',
          marginBlockStart: '0px',
          marginBlockEnd: '0px',
          lineHeight: '125%',
          fontSize: '20px',
          fontFamily: '$inter',
          fontWeight: 'bold',
        }}
      >
        Something has gone wrong.
      </StyledText>
      <SpanBox
        css={{
          marginBlockStart: '0px',
          marginBlockEnd: '0px',
          fontSize: '15px',
          lineHeight: '125%',
          fontFamily: '$inter',
          color: '$thTextSubtle2',
          textAlign: 'center',
        }}
      >
        We have encountered unexpected problems.{' '}
        <a
          href="https://docs.omnivore.app/using/help.html"
          target="_blank"
          rel="noreferrer"
        >
          Get help
        </a>
      </SpanBox>
    </VStack>
  )
}
