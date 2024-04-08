import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { EmailForgotPassword } from '../../components/templates/auth/EmailForgotPassword'
import { Toaster } from 'react-hot-toast'
import { GoogleReCaptchaProvider } from '@google-recaptcha/react'

export default function ForgotPassword(): JSX.Element {
  return (
    <GoogleReCaptchaProvider
      type="v2-checkbox"
      isEnterprise={true}
      siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_CHALLENGE_SITE_KEY ?? ''}
    >
      <PageMetaData
        title="Reset your password - Omnivore"
        path="/auth-forgot-password"
      />
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <ProfileLayout>
        <EmailForgotPassword />
      </ProfileLayout>
      <div data-testid="auth-forgot-password-page-tag" />
    </GoogleReCaptchaProvider>
  )
}
