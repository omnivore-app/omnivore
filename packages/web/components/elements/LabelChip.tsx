import { getLuminance, lighten, parseToRgba, toHsla } from 'color2k'
import { useRouter } from 'next/router'
import { Button } from './Button'
import { SpanBox } from './LayoutPrimitives'

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

  function f(x: number) {
    const channel = x / 255
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  }

  const luminance = getLuminance(props.color)
  const backgroundColor = hexToRgb(props.color)
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff'

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
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          padding: '5px 8px 5px 8px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          color: textColor,
          backgroundColor: `rgba(${backgroundColor}, 0.9)`,
        }}
      >
        {props.text}
      </SpanBox>
    </Button>
  )
}
