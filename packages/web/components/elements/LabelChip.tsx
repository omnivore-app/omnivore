import { getLuminance, lighten, parseToRgba, toHsla } from 'color2k'
import { useRouter } from 'next/router'
import { Button } from './Button'
import { SpanBox, HStack } from './LayoutPrimitives'
import { Circle } from 'phosphor-react'
import { isDarkTheme } from '../../lib/themeUpdater'

type LabelChipProps = {
  text: string
  color: string // expected to be a RGB hex color string
  isSelected?: boolean
  useAppAppearance?: boolean
}

export function LabelChip(props: LabelChipProps): JSX.Element {
  const router = useRouter()
  const isDark = isDarkTheme()

  const luminance = getLuminance(props.color)
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff'
  const selectedBorder = isDark ? 'white' : 'black'
  const unSelectedBorder = isDark ? '#6A6968' : '#D9D9D9'

  if (props.useAppAppearance) {
    return (
      <SpanBox
        css={{
          display: 'inline-table',
          margin: '2px',
          fontSize: '11px',
          fontWeight: '500',
          fontFamily: '$inter',
          padding: '4px 10px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          borderRadius: '5px',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: isDark ? '#EBEBEB' : '#2A2A2A',
          borderColor: props.isSelected ? selectedBorder : unSelectedBorder,
          backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
        }}
      >
        <HStack alignment="center" css={{ gap: '5px' }}>
          <Circle size={14} color={props.color} weight="fill" />
          <SpanBox css={{ pt: '1px' }}>{props.text}</SpanBox>
        </HStack>
      </SpanBox>
    )
  }

  return (
    <Button
      style="plainIcon"
      onClick={(e) => {
        router.push(`/home?q=label:"${props.text}"`)
        e.stopPropagation()
      }}
    >
      <SpanBox
        css={{
          display: 'inline-table',
          margin: '2px',
          borderRadius: '4px',
          color: textColor,
          fontSize: '13px',
          fontWeight: '500',
          padding: '3px 6px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          backgroundColor: props.color,
        }}
      >
        {props.text}
      </SpanBox>
    </Button>
  )
}
