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

type ReaderSettingsProps = {

}

export function ReaderSettings(props: ReaderSettingsProps): JSX.Element {
  const VerticalDivider = styled(SpanBox, {
      width: '1px',
      height: '100%',
      background: `${theme.colors.grayLine.toString()}`,
  })
  return (
    <VStack>
      <HStack 
        alignment='center'
        css={{
        width: '265px',
        height: '70px',
        borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
      }}>
        <Button style='plainIcon' onClick={() => {}}>
          <AIcon size={28} color={theme.colors.readerFont.toString()} />
          <Minus size={28} color={theme.colors.readerFont.toString()}/>
        </Button>
        <VerticalDivider />
        <Button style='plainIcon' onClick={() => {}}>
          <AIcon size={44} color={theme.colors.readerFont.toString()} />
          <Plus size={28} color={theme.colors.readerFont.toString()} />
        </Button>
      </HStack>
      <VStack css={{
        p: '0px',
        m: '0px',
        pb: '8px',
        width: '100%',
        height: '100%',
        borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
      }}>
        <StyledText color={theme.colors.readerFontTransparent.toString()} css={{ pl: '12px', m: '0px', pt: '14px' }}>Margin:</StyledText>
        <HStack distribution='between' css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}>
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }}>
            <ArrowsInLineHorizontal size={24} color={theme.colors.readerFont.toString()} />
          </Button>
          <TickedRangeSlider value={14} onChange={() => {}} />
          <Button style='plainIcon'  css={{ pt: '10px', px: '4px' }}>
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
          <TickedRangeSlider value={14} onChange={() => {}} />
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }}>
            <AlignCenterHorizontalSimple size={25} color={theme.colors.readerFont.toString()} />
          </Button>
        </HStack>
      </VStack>
    </VStack>
  )
}
