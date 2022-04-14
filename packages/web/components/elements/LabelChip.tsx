import Link from 'next/link'
import { SpanBox } from './LayoutPrimitives'
import { StyledText } from './StyledText'

type LabelChipProps = {
  text: string
  color: string // expected to be a RGB hex color string
}

export function LabelChip(props: LabelChipProps): JSX.Element {
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.substring(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return [r, g, b]
  }
  const color = hexToRgb(props.color)
  return (
    <Link href={`/home?q=label:"${props.text}"`}>
      <SpanBox
        css={{
          display: 'inline-table',
          margin: '4px',
          borderRadius: '32px',
          color: props.color,
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '4px 8px 4px 8px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          border: `1px solid rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`,
          backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`,
        }}
      >
        {props.text}
      </SpanBox>
    </Link>
  )
}
