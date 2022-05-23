import { PageMetaData } from '../components/patterns/PageMetaData'
import { ProfileLayout } from '../components/templates/ProfileLayout'
import { ConfirmProfileModal } from '../components/templates/ConfirmProfileModal'

export default function ConfirmProfilePage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Create Profile - Omnivore" path="/confirm-profile" />
      <ProfileLayout>
        <ConfirmProfileModal />
      </ProfileLayout>
      <div data-testid="confirm-profile-page-tag" />
    </>
  )
}
