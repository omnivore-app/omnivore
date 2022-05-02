type FontStepperUpProps = {
  color: string
}

export function FontStepperUp(props: FontStepperUpProps): JSX.Element {
  return (
    <svg width="72" height="46" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.2935 34.2954L21.7811 10.6606L9.26855 34.2954" stroke={props.color} stroke-width="2.78055" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30.6116 27.3442H12.9551" stroke={props.color} stroke-width="2.78055" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M48.3784 22.1471C47.9097 22.1471 47.5297 22.5271 47.5297 22.9958C47.5297 23.4646 47.9097 23.8446 48.3784 23.8446V22.1471ZM67.0507 23.8446C67.5194 23.8446 67.8994 23.4646 67.8994 22.9958C67.8994 22.5271 67.5194 22.1471 67.0507 22.1471V23.8446ZM58.5633 13.6597C58.5633 13.191 58.1833 12.811 57.7146 12.811C57.2458 12.811 56.8658 13.191 56.8658 13.6597H58.5633ZM56.8658 32.332C56.8658 32.8007 57.2458 33.1807 57.7146 33.1807C58.1833 33.1807 58.5633 32.8007 58.5633 32.332H56.8658ZM48.3784 23.8446H67.0507V22.1471H48.3784V23.8446ZM56.8658 13.6597V32.332H58.5633V13.6597H56.8658Z" fill={props.color} />
    </svg>
  )
}