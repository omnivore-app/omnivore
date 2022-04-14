type AIconProps = {
  size: number
  color: string
  style?: React.CSSProperties
}

export function AIcon(props: AIconProps): JSX.Element {
  return (
    <svg style={props.style} width={props.size} height={props.size} viewBox={`0 0 20 20`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.5 18L11.75 5.25L5 18" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.5133 14.25H6.98828" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}