import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { EmailLogin } from '../../components/templates/auth/EmailLogin'
import { GoogleReCaptchaProvider } from '@google-recaptcha/react'

export default function EmailLoginPage(): JSX.Element {
  return (
    <GoogleReCaptchaProvider
      type="v2-checkbox"
      isEnterprise={true}
      siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY ?? ''}
    >
      <PageMetaData title="Login - Omnivore" path="/email-login" />
      <ProfileLayout>
        <EmailLogin />
      </ProfileLayout>
      <div data-testid="email-login-page-tag" />
    </GoogleReCaptchaProvider>
  )
}
