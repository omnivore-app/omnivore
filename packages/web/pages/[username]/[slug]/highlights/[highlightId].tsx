import { GetServerSideProps } from 'next'
import { captureException, flush } from '@sentry/nextjs'
import { ArticleHighlights } from '../../../../components/templates/ArticleHighlights'
import { webBaseURL } from '../../../../lib/appConfig'
import objectToHash from '../../../../lib/highlights/objectToHash'
import {
  PublicArticleAttributes,
  publicArticleQuery,
} from '../../../../lib/networking/queries/useGetPublicArticleQuery'
import { useEffect } from 'react'

type PublicHighlightPageProps = {
  publicArticle: PublicArticleAttributes
  showAllHighlights: boolean
  selectedHighlightId?: string
  previewImagePath?: string
}

export default function PublicHighlightPage(
  props: PublicHighlightPageProps
): JSX.Element {
  useEffect(() => {
    window.analytics?.track('public_highlight_read', {
      link: props.publicArticle.id,
      slug: props.publicArticle.slug,
      url: props.publicArticle.url,
    })
  }, [props.publicArticle.url])

  return (
    <>
      <ArticleHighlights
        publicArticle={props.publicArticle}
        showAllHighlights={false}
        selectedHighlightId={props.selectedHighlightId}
        previewImagePath={props.previewImagePath}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PublicHighlightPageProps
> = async (ctx) => {
  const slug = ctx.query.slug as string
  const username = ctx.query.username as string
  const selectedHighlightId = ctx.query.highlightId as string

  try {
    const publicArticle = await publicArticleQuery(ctx, { username, slug })

    if (publicArticle) {
      const selectedHighlight = await publicArticle.highlights.find(
        (h) => h.shortId === selectedHighlightId
      )

      if (selectedHighlight) {
        const previewImageMeta = {
          highlightsCount: publicArticle.highlights.length,
          annotationsCount: publicArticle.highlights.filter(
            (h) => !!h.annotation
          ).length,
          quote: selectedHighlight.quote,
          prefix: selectedHighlight.prefix,
          suffix: selectedHighlight.suffix,
          annotation: selectedHighlight.annotation,
        }
        const previewImageHash = objectToHash(previewImageMeta)
        const previewServiceUrl = `${webBaseURL}/${username}/${slug}/highlights/${selectedHighlightId}/preview?pih=${previewImageHash}`
        const previewImagePath = `${webBaseURL}/preview?url=${encodeURIComponent(
          previewServiceUrl
        )}`

        return {
          props: {
            username,
            publicArticle,
            selectedHighlightId,
            previewImagePath,
            showAllHighlights: false,
          },
        }
      } else {
        throw new Error(
          'public article highlights query failed - no highlights'
        )
      }
    } else {
      throw new Error('public article highlights query failed - no article')
    }
  } catch (error) {
    captureException(error)
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await flush(2000)
    return { notFound: true }
  }
}
