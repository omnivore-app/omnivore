import { useRouter } from 'next/router'
import { TermsAndConditions } from '../components/templates/TermsAndConditions'
import { EmptyLayout } from '../components/templates/EmptyLayout'

export default function Terms(): JSX.Element {
  const router = useRouter()
  const appEmbedViewQuery = router.query.isAppEmbedView as string | undefined
  const isAppEmbedView = (appEmbedViewQuery ?? '').length > 0

  if (isAppEmbedView) {
    return <TermsAndConditions />
  } else {
    return (
      <EmptyLayout title="Terms and Conditions">
        <TermsAndConditions />
      </EmptyLayout>
    )
  }
}
