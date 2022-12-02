import { Label } from '../../../lib/networking/fragments/labelFragment'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalTitleBar,
} from '../../elements/ModalPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { LabelsProvider, SetLabelsControl } from './SetLabelsControl'

type SetLabelsModalProps = {
  provider?: LabelsProvider
  onOpenChange: (open: boolean) => void
  onSave: (labels: Label[] | undefined) => void
  save: (labels: Label[]) => Promise<Label[] | undefined>
}

export function SetLabelsModal(props: SetLabelsModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ border: '1px solid $grayBorder' }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <SpanBox css={{ p: '16px', width: '100%' }}>
            <ModalTitleBar title="Labels" onOpenChange={props.onOpenChange} />
          </SpanBox>
          <SetLabelsControl {...props} />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
