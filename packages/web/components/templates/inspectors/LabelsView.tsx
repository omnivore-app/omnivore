import { LabelAction } from '../../../lib/hooks/useSetPageLabels'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { EditLabelChipStack } from '../../elements/EditLabelChipStack'
import { LabelsPicker } from '../../elements/LabelsPicker'
import { Box, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { CaretDownIcon } from '../../elements/icons/CaretDownIcon'
import { theme } from '../../tokens/stitches.config'

type LabelsViewProps = {
  item: LibraryItemNode
}

export const LabelsView = (props: LabelsViewProps): JSX.Element => {
  return (
    <VStack
      tabIndex={-1}
      distribution="start"
      css={{
        height: 'calc(100% - 56px)',
        width: '100%',
        overflowY: 'auto',
        px: '20px',
      }}
    >
      <StyledText
        css={{
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
        }}
      >
        Selected Labels
      </StyledText>
      <LabelsPicker
        selectedLabels={props.item.labels ?? []}
        focused={false}
        inputValue={''}
        setInputValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        clearInputState={function (): void {
          throw new Error('Function not implemented.')
        }}
        dispatchLabels={function (action: {
          type: LabelAction
          labels: Label[]
        }): void {
          throw new Error('Function not implemented.')
        }}
        deleteLastLabel={function (): void {
          throw new Error('Function not implemented.')
        }}
        selectOrCreateLabel={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        tabCount={0}
        setTabCount={function (count: number): void {
          throw new Error('Function not implemented.')
        }}
        tabStartValue={''}
        setTabStartValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        highlightLastLabel={false}
        setHighlightLastLabel={function (set: boolean): void {
          throw new Error('Function not implemented.')
        }}
      />
      <Box css={{ mt: '100px' }} />

      <StyledText
        css={{
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
          gap: '10px',
        }}
      >
        <CaretDownIcon
          size={10}
          color={theme.colors.thTextContrast2.toString()}
        />
        <SpanBox css={{ ml: '10px' }}>Suggested Labels</SpanBox>
      </StyledText>
      <LabelsPicker
        selectedLabels={props.item.labels ?? []}
        focused={false}
        inputValue={''}
        setInputValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        clearInputState={function (): void {
          throw new Error('Function not implemented.')
        }}
        dispatchLabels={function (action: {
          type: LabelAction
          labels: Label[]
        }): void {
          throw new Error('Function not implemented.')
        }}
        deleteLastLabel={function (): void {
          throw new Error('Function not implemented.')
        }}
        selectOrCreateLabel={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        tabCount={0}
        setTabCount={function (count: number): void {
          throw new Error('Function not implemented.')
        }}
        tabStartValue={''}
        setTabStartValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        highlightLastLabel={false}
        setHighlightLastLabel={function (set: boolean): void {
          throw new Error('Function not implemented.')
        }}
      />

      <Box css={{ mt: '50px' }} />

      <StyledText
        css={{
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
          gap: '10px',
        }}
      >
        <CaretDownIcon
          size={10}
          color={theme.colors.thTextContrast2.toString()}
        />
        <SpanBox css={{ ml: '10px' }}>Available Labels</SpanBox>
      </StyledText>
      <LabelsPicker
        selectedLabels={props.item.labels ?? []}
        focused={false}
        inputValue={''}
        setInputValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        clearInputState={function (): void {
          throw new Error('Function not implemented.')
        }}
        dispatchLabels={function (action: {
          type: LabelAction
          labels: Label[]
        }): void {
          throw new Error('Function not implemented.')
        }}
        deleteLastLabel={function (): void {
          throw new Error('Function not implemented.')
        }}
        selectOrCreateLabel={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        tabCount={0}
        setTabCount={function (count: number): void {
          throw new Error('Function not implemented.')
        }}
        tabStartValue={''}
        setTabStartValue={function (value: string): void {
          throw new Error('Function not implemented.')
        }}
        highlightLastLabel={false}
        setHighlightLastLabel={function (set: boolean): void {
          throw new Error('Function not implemented.')
        }}
      />
    </VStack>
  )
}
