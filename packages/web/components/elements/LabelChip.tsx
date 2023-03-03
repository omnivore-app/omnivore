import { getLuminance, lighten } from 'color2k'
import { useRouter } from 'next/router'
import { Button } from './Button'
import { SpanBox } from './LayoutPrimitives'
import { isDarkTheme } from '../../lib/themeUpdater'

type LabelChipProps = {
  text: string
  color: string // expected to be a RGB hex color string
}

export function LabelChip(props: LabelChipProps): JSX.Element {
  const router = useRouter()

  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.substring(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return [r, g, b]
  }
  const isDarkMode = isDarkTheme()
  const luminance = getLuminance(props.color)
  const lightenColor = lighten(props.color, 0.2)
  const color = hexToRgb(props.color)
  const darkThemeTextColor =
    luminance > 0.2
      ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
      : lightenColor
  const lightThemeTextColor = luminance > 0.5 ? '#000000' : '#ffffff'
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
          color: lightThemeTextColor,
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
