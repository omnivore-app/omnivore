import { GoogleReCaptchaCheckbox } from '@google-recaptcha/react'

type RecaptchaProps = {
  setRecaptchaToken: (token: string) => void
}

export const Recaptcha = (props: RecaptchaProps): JSX.Element => {
  return (
    <>
      <GoogleReCaptchaCheckbox
        key="recaptcha"
        theme="dark"
        onChange={(token) => {
          console.log('recaptcha: ', token)
          props.setRecaptchaToken(token)
        }}
      />
    </>
  )
}
