import { useState } from 'react'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { ReadableItem } from '../../../lib/networking/library_items/useLibraryItems'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { HighlightView } from '../../patterns/HighlightView'

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
      css={{
        width: '100%',
        pt: '0px',
        pb: '0px',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VStack css={{ width: '100%', height: '100%' }}>
        <HighlightView
          viewer={props.viewer}
          item={props.item}
          highlight={props.highlight}
          updateHighlight={props.updateHighlight}
          viewInReader={props.viewInReader}
          setLabelsTarget={props.setSetLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
        <SpanBox css={{ mb: '15px' }} />
      </VStack>
    </HStack>
  )
}
