import { HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { useEffect, useState } from 'react'
import { AlignCenterHorizontalSimple, ArrowsInLineHorizontal, ArrowsOutLineHorizontal, Minus, Pen, Plus, Trash, X } from 'phosphor-react'
import { AIcon } from '../../elements/images/AIcon'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { showSuccessToast } from '../../../lib/toastHelpers'
import Image from 'next/image'

type ReaderSettingsProps = {
  marginWidth: number
  lineHeight: number
  articleActionHandler: (action: string, arg?: number) => void
}

const VerticalDivider = styled(SpanBox, {
  width: '1px',
  height: '100%',
  background: `${theme.colors.grayLine.toString()}`,
})

export function ReaderSettingsControl(props: ReaderSettingsProps): JSX.Element {
  const [lineHeight, setLineHeight] = useState(props.lineHeight)
  const [marginWidth, setMarginWidth] = useState(props.marginWidth)

  useEffect(() => {
    setLineHeight(props.lineHeight)
    setMarginWidth(props.marginWidth)
  }, [props.lineHeight, props.marginWidth, setLineHeight, setMarginWidth])

  return (
    <VStack>
      <HStack 
        alignment='center'
        distribution='between'
        css={{
          width: '100%',
          height: '70px',
          marginTop: '4px',
          borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
        }}
      >
        <Button style='plainIcon' css={{ width: '50%' }} onClick={() => props.articleActionHandler('decrementFontSize')}>
          <Image src='/static/icons/font-stepper-down.svg' width={56} height={32} />
        </Button>
        <VerticalDivider />
        <Button style='plainIcon' css={{ width: '50%', height: '100%' }} onClick={() => props.articleActionHandler('incrementFontSize')}>
          <Image src='/static/icons/font-stepper-up.svg' width={71} height={45} />
        </Button>
      </HStack>
      <VStack
        css={{
          p: '0px',
          m: '0px',
          pb: '14px',
          width: '100%',
          height: '100%',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <StyledText color={theme.colors.readerFontTransparent.toString()} css={{ pl: '8px', m: '0px', pt: '14px' }}>Margin:</StyledText>
        <HStack distribution='between' css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}>
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => {
            const newMarginWith = Math.max(marginWidth - 45, 200)
            setMarginWidth(newMarginWith)
            props.articleActionHandler('setMarginWidth', newMarginWith)
          }}>
            <ArrowsOutLineHorizontal size={24} color={theme.colors.readerFont.toString()} />
          </Button>
          <TickedRangeSlider min={200} max={560} step={45} value={marginWidth} onChange={(value) => {
            setMarginWidth(value)
            props.articleActionHandler('setMarginWidth', value)
          }} />
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => {
            const newMarginWith = Math.min(marginWidth + 45, 560)
            setMarginWidth(newMarginWith)
            props.articleActionHandler('setMarginWidth', newMarginWith)
          }}>
            <ArrowsInLineHorizontal size={24} color={theme.colors.readerFont.toString()} />
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
        <StyledText color={theme.colors.readerFontTransparent.toString()} css={{ pl: '12px', m: '0px', pt: '14px' }}>Line Spacing:</StyledText>
        <HStack distribution='between' css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}>
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => {
            const newLineHeight = Math.max(lineHeight - 25, 100)
            setLineHeight(newLineHeight)
            props.articleActionHandler('setLineHeight', newLineHeight)
          }}>
            <AlignCenterHorizontalSimple size={25} color={theme.colors.readerFont.toString()} />
          </Button>
          <TickedRangeSlider min={100} max={300} step={25} value={lineHeight} onChange={(value) => {
            setLineHeight(value)
            props.articleActionHandler('setLineHeight', value)
          }} />
          <Button style='plainIcon' css={{ pt: '10px', px: '4px' }} onClick={() => {
            const newLineHeight = Math.min(lineHeight + 25, 300)
            setLineHeight(newLineHeight)
            props.articleActionHandler('setLineHeight', newLineHeight)
          }}>
            <AlignCenterHorizontalSimple size={25} color={theme.colors.readerFont.toString()} />
          </Button>
        </HStack>

        <Button style='plainIcon' css={{ justifyContent: 'center', textDecoration: 'underline', display: 'flex', gap: '4px', width: '100%', fontSize: '12px', p: '8px', pb: '0px', pt: '16px', height: '42px', alignItems: 'center' }}
          onClick={() => {
            setMarginWidth(290)
            setLineHeight(150)
            props.articleActionHandler('resetReaderSettings')
            showSuccessToast('Display settings reset', { position: 'bottom-right' })
          }}
        >
        Reset to default
      </Button>
      </VStack>
    </VStack>
  )
}
