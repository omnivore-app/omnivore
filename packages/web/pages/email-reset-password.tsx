import { PageMetaData } from '../components/patterns/PageMetaData'
import { ProfileLayout } from '../components/templates/ProfileLayout'
import { EmailResetPassword } from '../components/templates/EmailResetPassword'

export default function EmailRegistrationPage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Reset your password - Omnivore" path="/email-reset-password" />
      <ProfileLayout>
        <EmailResetPassword />
      </ProfileLayout>
      <div data-testid="email-reset-password-page-tag" />
    </>
  )
}
