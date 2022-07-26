import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { EmailSignup } from '../../components/templates/auth/EmailSignup'

export default function EmailRegistrationPage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Sign up with Email - Omnivore" path="/auth-signup" />
      <ProfileLayout>
        <EmailSignup />
      </ProfileLayout>
      <div data-testid="auth-signup-page-tag" />
    </>
  )
}
