import { getLuminance, lighten, toHsla } from 'color2k'
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
  const lightenColor = lighten(props.color, 0.5)
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
          margin: '4px',
          borderRadius: '32px',
          color: isDarkMode ? darkThemeTextColor : lightThemeTextColor,
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '2px 5px 2px 5px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          border: isDarkMode ? `1px solid ${darkThemeTextColor}` :`1px solid rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`,
          backgroundColor: isDarkMode
            ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`
            : props.color,
        }}
      >
        {props.text}
      </SpanBox>
    </Button>
  )
}
