import { PageMetaData } from '../components/patterns/PageMetaData'
import { ProfileLayout } from '../components/templates/ProfileLayout'
import { ConfirmProfileForm } from '../components/templates/ConfirmProfileForm'

export default function ConfirmProfilePage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Create Profile - Omnivore" path="/confirm-profile" />
      <ProfileLayout>
        <ConfirmProfileForm />
      </ProfileLayout>
      <div data-testid="confirm-profile-page-tag" />
    </>
  )
}
