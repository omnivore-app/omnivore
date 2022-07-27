import { PageMetaData } from '../../components/patterns/PageMetaData'
import { VerifyEmail } from '../../components/templates/auth/VerifyEmail'

export default function VerifyEmailPage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Verify Email" path="/auth/verify-email" />
      <VerifyEmail />
      <div data-testid="auth/verify-email-page-tag" />
    </>
  )
}
