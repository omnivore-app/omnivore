import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { HStack, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { theme } from '../../tokens/stitches.config'
import { Label, useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { ChangeEvent, useCallback, useState } from 'react'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { LabelChip } from '../../elements/LabelChip'

type EditLabelsModalProps = {
  article: ArticleAttributes
  onOpenChange: (open: boolean) => void
  setLabels: (labels: Label[]) => void
}

export function EditLabelsModal(props: EditLabelsModalProps): JSX.Element {
  const [selectedLabels, setSelectedLabels] = useState(props.labels)
  const { labels } = useGetLabelsQuery()

  const saveAndExit = useCallback(async () => {
    const result = await setLabelsMutation(props.article.id, selectedLabels.map((l) => l.id))
    console.log('result of setting labels', result)
    props.onOpenChange(false)
    props.setLabels(selectedLabels)
  }, [props, selectedLabels])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // const label = event.target.value
      // if (event.target.checked) {
      //   setSelectedLabels([...selectedLabels, label])
      // } else {
      //   setSelectedLabels(selectedLabels.filter((l) => l !== label))
      // }
    },
    [selectedLabels]
  )

  return (
    <ModalRoot defaultOpen onOpenChange={saveAndExit}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto', p: '0' }}
      >
        <VStack distribution="start" css={{ p: '0' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%' }}
          >
            <StyledText style="modalHeadline" css={{ p: '16px' }}>
              Edit Labels
            </StyledText>
            <Button
              css={{ pt: '16px', pr: '16px' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={20}
                strokeColor={theme.colors.grayText.toString()}
              />
            </Button>
          </HStack>
          {labels &&
            labels.map((label) => (
              <HStack
                key={label.id}
                css={{ height: '50px', verticalAlign: 'middle' }}
                onClick={() => {
                  // if (selectedLabels.includes(label.id)) {
                  //   setSelectedLabels(
                  //     selectedLabels.filter((id) => id !== label.id)
                  //   )
                  // } else {
                  //   setSelectedLabels([...selectedLabels, label.id])
                  // }
                }}
              >
                <LabelChip color={label.color} text={label.name} />
                <input
                  type="checkbox"
                  value={label.id}
                  onChange={handleChange}
                  checked={selectedLabels.includes(label)}
                />
              </HStack>
            ))}
          <HStack css={{ width: '100%', mb: '16px' }} alignment="center">
            <Button style="ctaDarkYellow" onClick={saveAndExit}>
              Save
            </Button>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
