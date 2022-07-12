import { useRouter } from 'next/router'
import { useGetArticleOriginalHtmlQuery } from '../../../lib/networking/queries/useGetArticleOriginalHtmlQuery'

export default function Home(): JSX.Element {
  const router = useRouter()
  const originalHtml = useGetArticleOriginalHtmlQuery({
    username: router.query.username as string,
    slug: router.query.slug as string,
    includeFriendsHighlights: false,
  })

  if (!originalHtml) {
    return <div>error</div>
  }

  return (
    <textarea style={{ width: '100vw', height: '100vh' }}>
      {originalHtml}
    </textarea>
  )
}
