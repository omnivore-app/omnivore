import { HStack, VStack, SpanBox, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { useEffect, useState } from 'react'
import {
  AlignCenterHorizontalSimple,
  ArrowsInLineHorizontal,
  ArrowsOutLineHorizontal,
  CaretRight,
  Cursor,
} from 'phosphor-react'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { showSuccessToast } from '../../../lib/toastHelpers'
import { FontFamiliesOptions } from './FontFamiliesOptions'
import { useReaderSettings } from '../../../lib/hooks/useReaderSettings'

type ReaderSettingsProps = {
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
  const [showFontOptions, setShowFontOptions] = useState(false)
  const readerSettings = useReaderSettings()

  return (
    <VStack css={{ width: '100%' }}>
      {showFontOptions ? (
        <FontFamiliesOptions
          selected={readerSettings.fontFamily}
          setShowFontFamilies={setShowFontOptions}
          onSelect={(font: string) => {
            readerSettings.setFontFamily(font)
            props.articleActionHandler('setFontFamily', font)
          }}
        />
      ) : (
        <>
          <HStack
            alignment="center"
            distribution="between"
            css={{
              width: '100%',
              height: '44px',
              verticalAlign: 'baseline',
              borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
            }}
          >
            <Button
              style="plainIcon"
              css={{ width: '50%', fontSize: '32px' }}
              onClick={() => props.articleActionHandler('decrementFontSize')}
            >
              -
            </Button>
            <VerticalDivider />
            <Button
              style="plainIcon"
              css={{ width: '50%', height: '100%', fontSize: '32px' }}
              onClick={() => props.articleActionHandler('incrementFontSize')}
            >
              +
            </Button>
          </HStack>
          <HStack
            distribution="start"
            alignment="center"
            css={{
              m: '0px',
              px: '12px',
              py: '12px',
              width: '100%',
              height: '44px',
              verticalAlign: 'baseline',
              cursor: 'pointer',
            }}
            onClick={() => setShowFontOptions(true)}
          >
            <StyledText css={{ m: '0px' }}>Font:</StyledText>
            <StyledText
              css={{
                m: '0px',
                marginLeft: 'auto',
                pr: '4px',
                fontFamily: readerSettings.fontFamily,
                textTransform: 'capitalize',
              }}
            >
              {readerSettings.fontFamily}
            </StyledText>
            <CaretRight
              width={16}
              height={16}
              color={theme.colors.grayTextContrast.toString()}
            />
          </HStack>
          <HorizontalDivider
            css={{
              '@smDown': {
                display: 'none',
              },
            }}
          />
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
            <StyledText
              color={theme.colors.readerFontTransparent.toString()}
              css={{ pl: '12px', m: '0px', pt: '14px' }}
            >
              Margin:
            </StyledText>
            <HStack
              distribution="between"
              css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}
            >
              <Button
                style="plainIcon"
                css={{ pt: '10px', pl: '12px' }}
                onClick={() => {
                  const newMarginWith = Math.max(
                    readerSettings.marginWidth - 45,
                    200
                  )
                  readerSettings.setMarginWidth(newMarginWith)
                  props.articleActionHandler('setMarginWidth', newMarginWith)
                }}
              >
                <ArrowsOutLineHorizontal
                  size={24}
                  color={theme.colors.readerFont.toString()}
                />
              </Button>
              <TickedRangeSlider
                min={200}
                max={560}
                step={45}
                value={readerSettings.marginWidth}
                onChange={(value) => {
                  readerSettings.setMarginWidth(value)
                  props.articleActionHandler('setMarginWidth', value)
                }}
              />
              <Button
                style="plainIcon"
                css={{ pt: '10px', pr: '12px' }}
                onClick={() => {
                  const newMarginWith = Math.min(
                    readerSettings.marginWidth + 45,
                    560
                  )
                  readerSettings.setMarginWidth(newMarginWith)
                  props.articleActionHandler('setMarginWidth', newMarginWith)
                }}
              >
                <ArrowsInLineHorizontal
                  size={24}
                  color={theme.colors.readerFont.toString()}
                />
              </Button>
            </HStack>
          </VStack>
          <HorizontalDivider />

          <VStack
            css={{
              p: '0px',
              m: '0px',
              pb: '14px',
              width: '100%',
              height: '100%',
            }}
          >
            <StyledText
              color={theme.colors.readerFontTransparent.toString()}
              css={{ pl: '12px', m: '0px', pt: '14px' }}
            >
              Line Spacing:
            </StyledText>
            <HStack
              distribution="between"
              css={{ gap: '16px', alignItems: 'center', alignSelf: 'center' }}
            >
              <Button
                style="plainIcon"
                css={{ pt: '10px', pl: '12px' }}
                onClick={() => {
                  const newLineHeight = Math.max(
                    readerSettings.lineHeight - 25,
                    100
                  )
                  readerSettings.setLineHeight(newLineHeight)
                  props.articleActionHandler('setLineHeight', newLineHeight)
                }}
              >
                <AlignCenterHorizontalSimple
                  size={25}
                  color={theme.colors.readerFont.toString()}
                />
              </Button>
              <TickedRangeSlider
                min={100}
                max={300}
                step={25}
                value={readerSettings.lineHeight}
                onChange={(value) => {
                  readerSettings.setLineHeight(value)
                  props.articleActionHandler('setLineHeight', value)
                }}
              />
              <Button
                style="plainIcon"
                css={{ pt: '10px', pr: '12px' }}
                onClick={() => {
                  const newLineHeight = Math.min(
                    readerSettings.lineHeight + 25,
                    300
                  )
                  readerSettings.setLineHeight(newLineHeight)
                  props.articleActionHandler('setLineHeight', newLineHeight)
                }}
              >
                <AlignCenterHorizontalSimple
                  size={25}
                  color={theme.colors.readerFont.toString()}
                />
              </Button>
            </HStack>
          </VStack>
          <HorizontalDivider />

          <Button
            style="plainIcon"
            css={{
              justifyContent: 'center',
              textDecoration: 'underline',
              display: 'flex',
              gap: '4px',
              width: '100%',
              fontSize: '12px',
              p: '12px',
              pb: '14px',
              pt: '16px',
              height: '42px',
              alignItems: 'center',
            }}
            onClick={() => {
              readerSettings.setFontFamily('Inter')
              readerSettings.setMarginWidth(290)
              readerSettings.setLineHeight(150)
              props.articleActionHandler('resetReaderSettings')
              showSuccessToast('Display settings reset', {
                position: 'bottom-right',
              })
            }}
          >
            Reset to default
          </Button>
        </>
      )}
    </VStack>
  )
}
