type FontStepperDownProps = {
  color: string
}

export function FontStepperDown(props: FontStepperDownProps): JSX.Element {
  return (
    <svg width="56" height="29" viewBox="0 0 56 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.6079 19.5436L13.5525 8.10555L7.49707 19.5436" stroke={props.color} strokeWidth="1.75072" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M17.8261 16.1798H9.28125" stroke={props.color} strokeWidth="1.75072" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32.2515 13.9959H50.9237" stroke={props.color} strokeWidth="1.69748" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}