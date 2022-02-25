import { StyledText } from './StyledText'

type LabelProps = {
  text: string
  color: string // expected to be a RGB hex color string
}

export function Label(props: LabelProps): JSX.Element {
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.substring(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return [r, g, b]
  }
  const color = hexToRgb(props.color)
  return (
    <StyledText
      css={{
        margin: '4px',
        borderRadius: '32px',
        color: props.color,
        padding: '4px 8px 4px 8px',
        border: `1px solid ${props.color}`,
        backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
      }}
    >
      {props.text}
    </StyledText>
  )
}
