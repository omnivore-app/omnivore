import { useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { HighlightView } from '../../patterns/HighlightView'
import { HighlightsMenu } from '../homeFeed/HighlightItem'

type HighlightViewItemProps = {
  highlight: Highlight
  scrollToHighlight?: (arg: string) => void
  deleteHighlightAction: () => void
  updateHighlight: (highlight: Highlight) => void

  setSetLabelsTarget: (highlight: Highlight) => void
  setShowConfirmDeleteHighlightId: (id: string | undefined) => void
}

export function HighlightViewItem(props: HighlightViewItemProps): JSX.Element {
  const [hover, setHover] = useState(false)

  return (
    <HStack
      css={{ width: '100%', py: '20px', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VStack css={{ width: '100%' }}>
        <HighlightView
          highlight={props.highlight}
          scrollToHighlight={props.scrollToHighlight}
          updateHighlight={props.updateHighlight}
        />
        <SpanBox css={{ mb: '15px' }} />
      </VStack>
      <SpanBox
        css={{
          marginLeft: 'auto',
          width: '20px',
          visibility: hover ? 'unset' : 'hidden',
          '@media (hover: none)': {
            visibility: 'unset',
          },
        }}
      >
        <HighlightsMenu
          highlight={props.highlight}
          setLabelsTarget={props.setSetLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
      </SpanBox>
    </HStack>
  )
}
