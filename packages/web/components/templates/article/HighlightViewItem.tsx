import { useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { HighlightView } from '../../patterns/HighlightView'
import { HighlightsMenu } from '../homeFeed/HighlightItem'

type HighlightViewItemProps = {
  viewer: UserBasicData

  item: ReadableItem
  highlight: Highlight

  viewInReader: (highlightId: string) => void

  updateHighlight: (highlight: Highlight) => void

  setSetLabelsTarget: (highlight: Highlight) => void
  setShowConfirmDeleteHighlightId: (id: string | undefined) => void
}

export function HighlightViewItem(props: HighlightViewItemProps): JSX.Element {
  const [hover, setHover] = useState(false)

  return (
    <HStack
      css={{ width: '100%', py: '20px' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VStack css={{ width: '100%' }}>
        <HighlightView
          highlight={props.highlight}
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
          item={props.item}
          viewer={props.viewer}
          highlight={props.highlight}
          viewInReader={props.viewInReader}
          setLabelsTarget={props.setSetLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
      </SpanBox>
    </HStack>
  )
}
