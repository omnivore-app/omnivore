import { useGetAISummary } from '../../../lib/networking/queries/useGetAISummary'
import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { AIPromptIcon } from '../../elements/icons/AIPromotIcon'

type AISummaryProps = {
  idx: string
  libraryItemId: string

  fontFamily: string
  fontSize: number
  lineHeight: number
  readerFontColor: string
}

export const AISummary = (props: AISummaryProps): JSX.Element => {
  const aisummary = useGetAISummary({
    idx: props.idx,
    libraryItemId: props.libraryItemId,
  })

  if (!aisummary.summary) {
    return <></>
  }

  return (
    <VStack
      css={{
        p: '20px',
        mx: '50px',
        mt: '50px',
        mb: '50px',
        gap: '15px',
        border: '1px solid $thLibraryAISummaryBorder',
        color: props.readerFontColor,
        fontFamily: props.fontFamily,
        fontSize: `${props.fontSize - 2}px`,
        lineHeight: `${props.lineHeight}%`,
        borderRadius: '3px',
        background: '$thLibraryAISummaryBackground',
      }}
    >
      <SpanBox
        css={{
          px: '11px',
          bg: '#D0A3FF10',
          border: '1px solid #D0A3FF30',
          borderRadius: '4px',
          color: '#D0A3FF',
          fontSize: '12px',

          fontFamily: '$inter',
        }}
      >
        AI Summary
      </SpanBox>
      <SpanBox>{aisummary.summary}</SpanBox>
      <SpanBox css={{ ml: 'auto' }}>
        <AIPromptIcon />
      </SpanBox>
    </VStack>
  )
}
