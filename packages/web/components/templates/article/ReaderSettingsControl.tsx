import { HStack, VStack, SpanBox, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { useEffect, useState } from 'react'
import { AlignCenterHorizontalSimple, ArrowsInLineHorizontal, ArrowsOutLineHorizontal, CaretRight } from 'phosphor-react'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { showSuccessToast } from '../../../lib/toastHelpers'
import { FontStepperDown } from '../../elements/images/FontStepperDown'
import { FontStepperUp } from '../../elements/images/FontStepperUp'
import { FontFamiliesOptions } from './FontFamiliesOptions'

type ReaderSettingsProps = {
  marginWidth: number
  lineHeight: number
  fontFamily: string
  articleActionHandler: (action: string, arg?: number | string) => void
}

const VerticalDivider = styled(SpanBox, {
  width: '1px',
  height: '100%',
  background: `${theme.colors.grayLine.toString()}`,
})

const HorizontalDivider = styled(SpanBox, {
  width: '100%',
  height: '1px',
  background: `${theme.colors.grayLine.toString()}`,
})

export function ReaderSettingsControl(props: ReaderSettingsProps): JSX.Element {
  const [lineHeight, setLineHeight] = useState(props.lineHeight)
  const [marginWidth, setMarginWidth] = useState(props.marginWidth)
  const [fontFamily, setFontFamily] = useState(props.fontFamily)

  const [showFontOptions, setShowFontOptions] = useState(false)

  useEffect(() => {
    setLineHeight(props.lineHeight)
    setMarginWidth(props.marginWidth)
    setFontFamily(props.fontFamily)
  }, [props.lineHeight, props.marginWidth, props.fontFamily, setLineHeight, setMarginWidth, setFontFamily])

  return (
    <VStack>
      {showFontOptions ? (
        <FontFamiliesOptions
          selected={fontFamily}
          setShowFontFamilies={setShowFontOptions}
          onSelect={(font: string) => {
            setFontFamily(font)
            props.articleActionHandler('setFontFamily', font)
          }}
        />
      ) : (
        <>
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
            <FontStepperDown color={theme.colors.readerFont.toString()} />
          </Button>
          <VerticalDivider />
          <Button style='plainIcon' css={{ width: '50%', height: '100%' }} onClick={() => props.articleActionHandler('incrementFontSize')}>
            <FontStepperUp color={theme.colors.readerFont.toString()} />
          </Button>
        </HStack>
        <HStack
          distribution="start"
          alignment='center'
          css={{
            m: '0px',
            px: '12px',
            py: '12px',
            width: '100%',
            height: '100%',
          }}
        >
          <StyledText css={{ m: '0px' }}>Font:</StyledText>
          <HStack
            alignment='center'
            css={{cursor: 'pointer', marginLeft: 'auto' }}
            onClick={() => setShowFontOptions(true)}
          >
            <StyledText
              css={{ m: '0px',fontSize: 17, fontWeight: '600', fontFamily: fontFamily, textTransform: 'capitalize' }}
            >
              {fontFamily}
            </StyledText>
            <Box css={{  }}>
              <CaretRight width={16} height={16} color={theme.colors.grayTextContrast.toString()}/>
            </Box>
          </HStack>
        </HStack>
        <HorizontalDivider css={{
          '@smDown': {
            display: 'none',
          },
        }}/>
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
        <HorizontalDivider />

        <VStack css={{
          p: '0px',
          m: '0px',
          pb: '14px',
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
        </VStack>
          <HorizontalDivider />

          <Button style='plainIcon' css={{ justifyContent: 'center', textDecoration: 'underline', display: 'flex', gap: '4px', width: '100%', fontSize: '12px', p: '8px', pb: '14px', pt: '16px', height: '42px', alignItems: 'center' }}
            onClick={() => {
              setMarginWidth(290)
              setLineHeight(150)
              props.articleActionHandler('resetReaderSettings')
              showSuccessToast('Display settings reset', { position: 'bottom-right' })
            }}
          >
            Reset to default
          </Button>
        </>
      )}
    </VStack>
  )
}
