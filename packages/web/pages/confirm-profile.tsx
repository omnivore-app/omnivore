import { PageMetaData } from '../components/patterns/PageMetaData'
import { OnboardingLayout } from '../components/templates/OnboardingLayout'
import { ConfirmProfileModal } from '../components/templates/ConfirmProfileModal'

export default function ConfirmProfilePage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Create Profile - Omnivore" path="/confirm-profile" />
      <OnboardingLayout>
        <ConfirmProfileModal />
      </OnboardingLayout>
      <div data-testid="confirm-profile-page-tag" />
    </>
  )
}
