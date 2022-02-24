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
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { ChangeEvent, useCallback, useState } from 'react'
import { Label } from '../../elements/Label'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'

type EditLabelsModalProps = {
  article: ArticleAttributes
  onOpenChange: (open: boolean) => void
}

export function EditLabelsModal(props: EditLabelsModalProps): JSX.Element {
  const [selectedLabels, setSelectedLabels] = useState(
    props.article.labels?.map((l) => l.id) || []
  )
  const { labels, revalidate, isValidating } = useGetLabelsQuery()

  const saveAndExit = useCallback(async () => {
    const result = await setLabelsMutation(props.article.linkId, selectedLabels)
    console.log('result of setting labels', result)
    props.onOpenChange(false)
  }, [selectedLabels, props.onOpenChange])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const label = event.target.value
      if (event.target.checked) {
        setSelectedLabels([...selectedLabels, label])
      } else {
        setSelectedLabels(selectedLabels.filter((l) => l !== label))
      }
    },
    [selectedLabels, setSelectedLabels]
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
                  if (selectedLabels.includes(label.id)) {
                    setSelectedLabels(
                      selectedLabels.filter((id) => id !== label.id)
                    )
                  } else {
                    setSelectedLabels([...selectedLabels, label.id])
                  }
                }}
              >
                <Label color={label.color} text={label.name} />
                <input
                  type="checkbox"
                  value={label.id}
                  onChange={handleChange}
                  checked={selectedLabels.includes(label.id)}
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
