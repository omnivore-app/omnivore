import { useRouter } from 'next/router'
import { TermsAndConditions } from '../components/templates/TermsAndConditions'
import { SettingsLayout } from '../components/templates/SettingsLayout'

export default function Terms(): JSX.Element {
  const router = useRouter()
  const appEmbedViewQuery = router.query.isAppEmbedView as string | undefined
  const isAppEmbedView = (appEmbedViewQuery ?? '').length > 0

  if (isAppEmbedView) {
    return <TermsAndConditions />
  } else {
    return (
      <SettingsLayout title="Terms and Conditions">
        <TermsAndConditions />
      </SettingsLayout>
    )
  }
}
