import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { EmailSignup } from '../../components/templates/auth/EmailSignup'
import { GoogleReCaptchaProvider } from '@google-recaptcha/react'

export default function EmailRegistrationPage(): JSX.Element {
  return (
    <>
      <GoogleReCaptchaProvider
        type="v2-checkbox"
        isEnterprise={true}
        siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY ?? ''}
      >
        <PageMetaData
          title="Sign up with Email - Omnivore"
          path="/auth-signup"
        />
        <ProfileLayout>
          <EmailSignup />
        </ProfileLayout>
      </GoogleReCaptchaProvider>
    </>
  )
}
