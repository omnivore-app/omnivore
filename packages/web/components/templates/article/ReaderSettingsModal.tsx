import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { Box, HStack, VStack, Separator, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { styled, theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { AlignCenterHorizontalSimple, ArrowsInLineHorizontal, ArrowsOutLineHorizontal, Minus, Pen, Plus, Trash } from 'phosphor-react'
import { AIcon } from '../../elements/images/AIcon'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { UserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'

type ReaderSettingsProps = {
  userPreferences?: UserPreferences
  articleActionHandler: (action: string, arg?: number) => void
}

const VerticalDivider = styled(SpanBox, {
  width: '1px',
  height: '100%',
  background: `${theme.colors.grayLine.toString()}`,
})

export function ReaderSettings(props: ReaderSettingsProps): JSX.Element {
  const [marginWidth, setMarginWidth] = useState(props.userPreferences?.margin ?? 0)

  return (
    <VStack>
      <HStack 
        alignment='center'
        css={{
          width: '265px',
          height: '70px',
          borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
        }}
      >
        <Button style='plainIcon' onClick={() => props.articleActionHandler('decrementFontSize')}>
          <AIcon size={28} color={theme.colors.readerFont.toString()} />
          <Minus size={28} color={theme.colors.readerFont.toString()}/>
        </Button>
        <VerticalDivider />
        <Button style='plainIcon' onClick={() => props.articleActionHandler('incrementFontSize')}>
          <AIcon size={44} color={theme.colors.readerFont.toString()} />
          <Plus size={28} color={theme.colors.readerFont.toString()} />
        </Button>
      </HStack>
      <VStack
        css={{
          p: '0px',
          m: '0px',
          pb: '14px',
          width: '100%',
          height: '100%',
          '@smDown': {
            display: 'none',
          },
        }}
      >
        <StyledText color={theme.colors.readerFontTransparent.toString()} css={{ pl: '12px', m: '0px', pt: '14px' }}>Margin:</StyledText>
        <HStack distribution='between' css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}>
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => props.articleActionHandler('decrementMarginWidth')}>
            <ArrowsInLineHorizontal size={24} color={theme.colors.readerFont.toString()} />
          </Button>
          <TickedRangeSlider min={200} max={560} step={45} value={marginWidth} onChange={(value) => {
            setMarginWidth(value)
            props.articleActionHandler('setMarginWidth', value)
          }} />
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => props.articleActionHandler('incrementMarginWidth')}>
            <ArrowsOutLineHorizontal size={24} color={theme.colors.readerFont.toString()} />
          </Button>
        </HStack>
      </VStack>
      <VStack css={{
        p: '0px',
        m: '0px',
        pb: '12px',
        width: '100%',
        height: '100%',
      }}>
        <StyledText color={theme.colors.readerFontTransparent.toString()} css={{ pl: '12px', m: '0px', pt: '14px' }}>Line Height:</StyledText>
        <HStack distribution='between' css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}>
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }}>
            <AlignCenterHorizontalSimple size={25} color={theme.colors.readerFont.toString()} />
          </Button>
          <TickedRangeSlider value={14} onChange={(value) => {
            console.log('changed line spacing')
          }} />
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }}>
            <AlignCenterHorizontalSimple size={25} color={theme.colors.readerFont.toString()} />
          </Button>
        </HStack>
      </VStack>
    </VStack>
  )
}
