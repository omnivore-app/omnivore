import { useRouter } from 'next/router'
import { PrivacyPolicy } from '../components/templates/PrivacyPolicy'
import { SettingsLayout } from '../components/templates/SettingsLayout'

export default function Privacy(): JSX.Element {
  const router = useRouter()
  const appEmbedViewQuery = router.query.isAppEmbedView as string | undefined
  const isAppEmbedView = (appEmbedViewQuery ?? '').length > 0

  if (isAppEmbedView) {
    return <PrivacyPolicy />
  } else {
    return (
      <SettingsLayout>
        <PrivacyPolicy />
      </SettingsLayout>
    )
  }
}
