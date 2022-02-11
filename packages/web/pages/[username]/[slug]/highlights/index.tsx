import { GetServerSideProps } from 'next'
import { ArticleHighlights } from '../../../../components/templates/ArticleHighlights'
import {
  PublicArticleAttributes,
  publicArticleQuery,
} from '../../../../lib/networking/queries/useGetPublicArticleQuery'
import { captureException, flush } from '@sentry/nextjs'
import { useEffect } from 'react'

type PublicHighlightsPageProps = {
  publicArticle: PublicArticleAttributes
}

export default function PublicHighlightsPage(
  props: PublicHighlightsPageProps
): JSX.Element {

  useEffect(() => {
    window.analytics?.track('public_link_read', {
      link: props.publicArticle.id,
      slug: props.publicArticle.slug,
      url: props.publicArticle.url
    })
  }, [props.publicArticle.url])

  return (
    <ArticleHighlights
      showAllHighlights={true}
      publicArticle={props.publicArticle}
    />
  )
}

export const getServerSideProps: GetServerSideProps<
  PublicHighlightsPageProps
> = async (ctx) => {
  const slug = ctx.query.slug as string
  const username = ctx.query.username as string

  try {
    const publicArticle = await publicArticleQuery(ctx, { username, slug })

    if (publicArticle) {
      if (publicArticle.highlights.length === 0) {
        return {
          redirect: {
            destination: publicArticle.url,
            permanent: false,
          },
        }
      }

      return {
        props: {
          username,
          publicArticle,
        },
      }
    } else {
      throw new Error('article highlights request failed')
    }
  } catch (error) {
    captureException(error)
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await flush(2000)
    return { notFound: true }
  }
}
