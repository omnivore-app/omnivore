import { PageMetaData } from '../components/patterns/PageMetaData'
import { VerifyEmail } from '../components/templates/VerifyEmail'

export default function VerifyEmailPage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Verify Email" path="/verify-email" />
      <VerifyEmail />
      <div data-testid="verify-email-page-tag" />
    </>
  )
}
