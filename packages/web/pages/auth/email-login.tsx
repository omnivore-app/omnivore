import { PageMetaData } from '../../components/patterns/PageMetaData'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { EmailLogin } from '../../components/templates/auth/EmailLogin'

export default function EmailLoginPage(): JSX.Element {
  return (
    <AuthLayout>
      <PageMetaData title="Login - Omnivore" path="/email-login" />
      <EmailLogin />
      <div data-testid="email-login-page-tag" />
    </AuthLayout>
  )
}
