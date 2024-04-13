import { PageMetaData } from '../../components/patterns/PageMetaData'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { EmailSignup } from '../../components/templates/auth/EmailSignup'

export default function EmailRegistrationPage(): JSX.Element {
  return (
    <AuthLayout>
      <PageMetaData title="Sign up with Email - Omnivore" path="/auth-signup" />
      <EmailSignup />
    </AuthLayout>
  )
}
