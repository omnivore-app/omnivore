import { PageMetaData } from '../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import { ResetSent } from '../../components/templates/ResetSent'

export default function EmailResetSent(): JSX.Element {
  return (
    <>
      <PageMetaData title="Reset password email sent - Omnivore" path="/auth-reset-sent" />
      <ProfileLayout>
        <ResetSent />
      </ProfileLayout>
      <div data-testid="auth-reset-sent-page-tag" />
    </>
  )
}
