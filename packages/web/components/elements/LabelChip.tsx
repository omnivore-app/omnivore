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
  const color = hexToRgb(props.color)

  return (
    <Button style="plainIcon" onClick={(e) => {
      router.push(`/home?q=label:"${props.text}"`)
      e.stopPropagation()
    }}>
      <SpanBox
        css={{
          display: 'inline-table',
          margin: '4px',
          borderRadius: '32px',
          color: props.color,
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '2px 7px 2px 7px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          backgroundClip: 'padding-box',
          border: `1px solid rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`,
          backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`,
        }}
      >
        {props.text}
      </SpanBox>
    </Button>
  )
}
