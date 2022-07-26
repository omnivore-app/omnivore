import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { EmailLogin } from '../../components/templates/EmailLogin'

export default function EmailLoginPage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Login - Omnivore" path="/email-login" />
      <ProfileLayout>
        <EmailLogin />
      </ProfileLayout>
      <div data-testid="email-login-page-tag" />
    </>
  )
}
