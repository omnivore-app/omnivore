import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useGetArticleSavingStatus } from '../../../lib/networking/queries/useGetArticleSavingStatus'
import { PrimaryLayout } from '../../../components/templates/PrimaryLayout'
import {
  Loader,
  ErrorComponent,
} from '../../../components/templates/SavingRequest'

export default function ArticleSavingRequestPage(): JSX.Element {
  const router = useRouter()
  const [articleId, setArticleId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!router.isReady) return
    setArticleId(router.query.id as string)
  }, [router.isReady, router.query.id])

  return (
    <PrimaryLayout pageTestId="saving-request-page-tag">
      {articleId ? <PrimaryContent articleId={articleId} /> : <Loader />}
    </PrimaryLayout>
  )
}

type PrimaryContentProps = {
  articleId: string
}

function PrimaryContent(props: PrimaryContentProps): JSX.Element {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  const { successRedirectPath, error } = useGetArticleSavingStatus({
    id: props.articleId,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, 30000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (error === 'unauthorized') {
    router.replace('/login')
  }

  if (timedOut || error) {
    return (
      <ErrorComponent errorMessage="Something went wrong while processing the link, please try again in a moment" />
    )
  }

  if (successRedirectPath) {
    router.replace(successRedirectPath)
  }

  return <Loader />
}
