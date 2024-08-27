import { PageMetaData } from '../../components/patterns/PageMetaData'
import { AuthLayout } from '../../components/templates/AuthLayout'
import { EmailForgotPassword } from '../../components/templates/auth/EmailForgotPassword'

export default function ForgotPassword(): JSX.Element {
  return (
    <AuthLayout>
      <PageMetaData
        title="Reset your password - Omnivore"
        path="/auth-forgot-password"
      />
      <EmailForgotPassword />
      <div data-testid="auth-forgot-password-page-tag" />
    </AuthLayout>
  )
}
