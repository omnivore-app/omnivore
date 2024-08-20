import { HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme, ThemeId } from '../../tokens/stitches.config'
import {
  ArrowsHorizontal,
  ArrowsInLineHorizontal,
  CaretLeft,
  CaretRight,
  Check,
} from '@phosphor-icons/react'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { showSuccessToast } from '../../../lib/toastHelpers'
import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { useCallback, useState } from 'react'
import { updateTheme } from '../../../lib/themeUpdater'
import { LineHeightIncreaseIcon } from '../../elements/images/LineHeightIncreaseIconProps'
import { LineHeightDecreaseIcon } from '../../elements/images/LineHeightDecreaseIcon'
import * as Switch from '@radix-ui/react-switch'
import { useCurrentTheme } from '../../../lib/hooks/useCurrentTheme'
import { useDarkModeListener } from '../../../lib/hooks/useDarkModeListener'

type ReaderSettingsProps = {
  readerSettings: ReaderSettings
}

const HorizontalDivider = styled(SpanBox, {
  width: '100%',
  height: '1px',
  background: `${theme.colors.grayLine.toString()}`,
})

const FONT_FAMILIES = [
  'Inter',
  'System Default',
  'Merriweather',
  'Lora',
  'Open Sans',
  'Roboto',
  'Newsreader',
  'Lexend',
  'Montserrat',
  'Crimson Text',
  'OpenDyslexic',
  'Source Serif Pro',
  'LXGWWenKai',
  'AtkinsonHyperlegible',
  'IBMPlexSans',
  'Fraunces',
  'Literata',
  'SuperNotesPro',
]

type SettingsProps = {
  readerSettings: ReaderSettings
  setShowAdvanced: (show: boolean) => void
}

export function ReaderSettingsControl(props: ReaderSettingsProps): JSX.Element {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <>
      {showAdvanced ? (
        <AdvancedSettings
          readerSettings={props.readerSettings}
          setShowAdvanced={setShowAdvanced}
        />
      ) : (
        <BasicSettings
          readerSettings={props.readerSettings}
          setShowAdvanced={setShowAdvanced}
        />
      )}
    </>
  )
}

function AdvancedSettings(props: SettingsProps): JSX.Element {
  const { readerSettings } = props

  return (
    <VStack
      css={{ width: '100%', minHeight: '320px', p: '10px' }}
      alignment="start"
      distribution="start"
    >
      <Button
        style="plainIcon"
        css={{
          m: '10px',
          mb: '20px',
          display: 'flex',
          fontSize: '12px',
          fontWeight: '400',
          fontFamily: '$display',
          alignItems: 'center',
          borderRadius: '6px',
          gap: '5px',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={() => {
          props.setShowAdvanced(false)
        }}
      >
        <CaretLeft size={12} color="#969696" weight="bold" />
        Back
      </Button>

      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="justify-text" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            Justify Text
          </StyledText>
        </Label>
        <SwitchRoot
          id="justify-text"
          checked={readerSettings.justifyText ?? false}
          onCheckedChange={(checked) => {
            readerSettings.setJustifyText(checked)
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>

      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="high-contrast-text" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            High Contrast Text
          </StyledText>
        </Label>
        <SwitchRoot
          id="high-contrast-text"
          checked={readerSettings.highContrastText ?? false}
          onCheckedChange={(checked) => {
            readerSettings.setHighContrastText(checked)
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>

      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="auto-highlight-mode" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            Right-to-left text
          </StyledText>
        </Label>
        <SwitchRoot
          id="rtl-text"
          checked={readerSettings.textDirection == 'RTL'}
          onCheckedChange={(checked) => {
            readerSettings.setTextDirection(checked ? 'RTL' : 'LTR')
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>

      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="auto-highlight-mode" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            Auto highlight mode
          </StyledText>
        </Label>
        <SwitchRoot
          id="high-contrast-text"
          checked={readerSettings.highlightOnRelease ?? false}
          onCheckedChange={(checked) => {
            readerSettings.setHighlightOnRelease(checked)
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>
    </VStack>
  )
}

const SwitchRoot = styled(Switch.Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$thBorderColor',
  borderRadius: '9999px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 2px $thBorderColor` },
  '&[data-state="checked"]': { backgroundColor: '$thBorderColor' },
})

const SwitchThumb = styled(Switch.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: '$thTextContrast2',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
})

const Label = styled('label', {
  color: 'white',
  fontSize: 15,
  lineHeight: 1,
})

function BasicSettings(props: SettingsProps): JSX.Element {
  const { readerSettings } = props
  return (
    <VStack css={{ width: '100%' }}>
      <FontControls readerSettings={readerSettings} />

      <HorizontalDivider />

      <LayoutControls readerSettings={readerSettings} />

      <HorizontalDivider />

      <SpanBox css={{ px: '10px', width: '100%' }}>
        <ThemeSelector />
      </SpanBox>

      <HorizontalDivider />

      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', p: '10px' }}
      >
        <Button
          style="plainIcon"
          css={{
            pl: '10px',
            display: 'flex',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: '$display',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            readerSettings.setFontFamily('Inter')
            readerSettings.setMarginWidth(290)
            readerSettings.setLineHeight(150)
            readerSettings.actionHandler('resetReaderSettings')
            showSuccessToast('Reader Preferences Reset', {
              position: 'bottom-right',
            })
          }}
        >
          Reset
        </Button>
        <Button
          style="plainIcon"
          css={{
            p: '5px',
            display: 'flex',
            fontSize: '12px',
            fontWeight: '400',
            fontFamily: '$display',
            marginLeft: 'auto',
            alignItems: 'center',
            borderRadius: '6px',
            gap: '5px',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            props.setShowAdvanced(true)
          }}
        >
          Advanced Settings
          <CaretRight size={12} color="#969696" weight="bold" />
        </Button>
      </HStack>
    </VStack>
  )
}

type FontControlsProps = {
  readerSettings: ReaderSettings
}

function FontControls(props: FontControlsProps): JSX.Element {
  const { readerSettings } = props
  const FontSelect = styled('select', {
    pl: '5px',
    height: '30px',
    minWidth: '100px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    background: '$thBackground',
    border: '1px solid $thBorderColor',
    fontFamily: readerSettings.fontFamily,
    textTransform: 'capitalize',
    borderRadius: '4px',
  })

  const handleFontSizeChange = useCallback(
    (value: number) => {
      readerSettings.actionHandler('setFontSize', value)
    },
    [readerSettings]
  )

  return (
    <VStack css={{ width: '100%', pb: '20px' }}>
      <HStack
        distribution="start"
        alignment="start"
        css={{ width: '100%', p: '20px', pb: '10px' }}
      >
        <StyledText style="displaySettingsLabel">Font</StyledText>
        <FontSelect
          css={{ marginLeft: 'auto' }}
          tabIndex={-1}
          defaultValue={readerSettings.fontFamily}
          onChange={(e: React.FormEvent<HTMLSelectElement>) => {
            const font = e.currentTarget.value
            if (FONT_FAMILIES.indexOf(font) < 0) {
              return
            }
            readerSettings.setFontFamily(font)
          }}
        >
          {FONT_FAMILIES.map((family) => (
            <option key={`font-${family}`} value={family}>
              {family}
            </option>
          ))}
        </FontSelect>
      </HStack>
      <HStack
        css={{ px: '10px', width: '100%' }}
        distribution="start"
        alignment="center"
      >
        <Button
          style="plainIcon"
          css={{ py: '0px', width: '60px' }}
          onClick={() => {
            readerSettings.actionHandler('decrementFontSize')
          }}
        >
          <SpanBox
            css={{
              fontFamily: '$display',
              fontStyle: 'normal',
              fontWeight: '400',
              fontSize: '20px',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#969696',
              width: '50px',
              pr: '5px',
              pb: '5px',
            }}
          >
            a
          </SpanBox>
        </Button>
        <TickedRangeSlider
          min={10}
          max={48}
          step={2}
          value={props.readerSettings.fontSize}
          onChange={handleFontSizeChange}
        />
        <Button
          style="plainIcon"
          css={{ py: '0px', width: '60px' }}
          onClick={() => {
            props.readerSettings.actionHandler('incrementFontSize')
          }}
        >
          <SpanBox
            css={{
              fontFamily: '$display',
              fontStyle: 'normal',
              fontWeight: '400',
              fontSize: '20px',
              lineHeight: '20px',

              textAlign: 'center',

              color: '#969696',
              width: '60px',
              pl: '16px',
            }}
          >
            A
          </SpanBox>
        </Button>
      </HStack>
    </VStack>
  )
}

type LayoutControlsProps = {
  readerSettings: ReaderSettings
}

function LayoutControls(props: LayoutControlsProps): JSX.Element {
  const { readerSettings } = props

  const handleMarginWidthChange = useCallback(
    (value: number) => {
      readerSettings.setMarginWidth(value)
    },
    [readerSettings]
  )

  return (
    <>
      <VStack
        css={{
          m: '0px',
          px: '0px',
          pb: '10px',
          width: '100%',
          height: '100%',
        }}
      >
        <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
          Margin
        </StyledText>
        <HStack
          distribution="between"
          css={{
            width: '100%',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newMarginWith = Math.max(
                readerSettings.marginWidth - 45,
                200
              )
              readerSettings.setMarginWidth(newMarginWith)
            }}
          >
            <ArrowsHorizontal size={24} color="#969696" />
          </Button>
          <TickedRangeSlider
            min={200}
            max={560}
            step={45}
            value={readerSettings.marginWidth}
            onChange={handleMarginWidthChange}
          />
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newMarginWith = Math.min(
                readerSettings.marginWidth + 45,
                560
              )
              readerSettings.setMarginWidth(newMarginWith)
            }}
          >
            <ArrowsInLineHorizontal size={24} color="#969696" />
          </Button>
        </HStack>
      </VStack>

      <VStack
        css={{
          m: '0px',
          px: '0px',
          pb: '20px',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
          Line Height
        </StyledText>
        <HStack
          distribution="between"
          css={{
            width: '100%',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newLineHeight = Math.max(
                props.readerSettings.lineHeight - 25,
                100
              )
              props.readerSettings.setLineHeight(newLineHeight)
            }}
          >
            <LineHeightDecreaseIcon
              strokeColor={theme.colors.readerFont.toString()}
            />
          </Button>
          <TickedRangeSlider
            min={100}
            max={300}
            step={25}
            value={props.readerSettings.lineHeight}
            onChange={(value) => {
              props.readerSettings.setLineHeight(value)
            }}
          />
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newLineHeight = Math.min(
                props.readerSettings.lineHeight + 25,
                300
              )
              props.readerSettings.setLineHeight(newLineHeight)
            }}
          >
            <LineHeightIncreaseIcon
              strokeColor={theme.colors.readerFont.toString()}
            />
          </Button>
        </HStack>
      </VStack>
    </>
  )
}

export function ThemeSelector(): JSX.Element {
  useDarkModeListener()
  const { currentTheme, setCurrentTheme, resetSystemTheme } = useCurrentTheme()

  return (
    <VStack
      css={{
        px: '10px',
        m: '0px',
        pb: '10px',
        width: '100%',
        height: '100%',
      }}
    >
      <HStack
        distribution="start"
        css={{
          width: '100%',
        }}
      >
        <StyledText style="displaySettingsLabel">Themes</StyledText>
        <HStack
          alignment="center"
          distribution="center"
          css={{ ml: 'auto', gap: '5px', mt: '10px', cursor: 'pointer' }}
          onClick={() => {
            console.log('clicked use system')
            updateTheme(ThemeId.System)
          }}
        >
          <Label
            htmlFor="auto-checkbox"
            css={{
              fontFamily: '$display',
              fontWeight: '500',
              fontSize: '12px',
              lineHeight: '20px',
              color: '$thTextSubtle2',
            }}
          >
            Auto
          </Label>
          <input
            type="checkbox"
            id="auto-checkbox"
            checked={currentTheme == ThemeId.System}
            onChange={(event) => {
              if (event.target.checked) {
                setCurrentTheme(ThemeId.System)
              } else {
                resetSystemTheme()
              }
              event.stopPropagation()
            }}
          ></input>
        </HStack>
      </HStack>

      <HStack
        distribution="start"
        css={{
          gap: '16px',
          pl: '5px',
        }}
      >
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#F5F5F5',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={currentTheme == ThemeId.Light ? 'selected' : 'unselected'}
          onClick={() => {
            setCurrentTheme(ThemeId.Light)
          }}
        >
          {currentTheme == ThemeId.Light && (
            <Check color="#6A6968" size={15} weight="bold" />
          )}
        </Button>
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#2A2A2A',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={currentTheme == ThemeId.Dark ? 'selected' : 'unselected'}
          onClick={() => {
            setCurrentTheme(ThemeId.Dark)
          }}
        >
          {currentTheme == ThemeId.Dark && <Check color="#F9D354" size={20} />}
        </Button>
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#FBF0D9',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={currentTheme == ThemeId.Sepia ? 'selected' : 'unselected'}
          onClick={() => {
            setCurrentTheme(ThemeId.Sepia)
          }}
        >
          {currentTheme == ThemeId.Sepia && <Check color="#6A6968" size={20} />}
        </Button>
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#6A6968',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={
            currentTheme == ThemeId.Apollo ? 'selected' : 'unselected'
          }
          onClick={() => {
            setCurrentTheme(ThemeId.Apollo)
          }}
        >
          {currentTheme == ThemeId.Apollo && (
            <Check color="#F9D354" size={20} />
          )}
        </Button>
      </HStack>
    </VStack>
  )
}
