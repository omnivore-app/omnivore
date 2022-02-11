import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import {
  Box,
  SpanBox,
} from '../../../../../components/elements/LayoutPrimitives'
import {
  HighlightFooter,
  PublicHighlightView,
} from '../../../../../components/patterns/HighlightView'
import objectToHash from '../../../../../lib/highlights/objectToHash'
import {
  PublicArticleAttributes,
  publicArticleQuery,
} from '../../../../../lib/networking/queries/useGetPublicArticleQuery'
import { captureException, flush } from '@sentry/nextjs'

type PublicHighlightPageProps = {
  publicArticle: PublicArticleAttributes
  showAllHighlights: boolean
  selectedHighlightId?: string
  previewImageFileName?: string
}

export default function PublicHighlightPage(
  props: PublicHighlightPageProps
): JSX.Element {
  const router = useRouter()
  const selectedHighlight = useMemo(() => {
    if (!props.selectedHighlightId) {
      return null
    }
    return props.publicArticle.highlights.find(
      (h) => h.shortId === props.selectedHighlightId
    )
  }, [props.selectedHighlightId, props.publicArticle])

  const articleSite = useMemo(() => {
    try {
      const url = new URL(props.publicArticle.url)
      return url.hostname
    } catch (e) {
      console.log('error ', e)
      return ''
    }
  }, [props.publicArticle.url])

  // Adjusting the aspect ratio accordingly to the query parameter
  useEffect(() => {
    if (router.isReady && router.query.adjustAspectRatio) {
      const highlightContainer = document.getElementById(
        'selected_highlight_wrapper'
      )
      const footer = document.getElementById('selected_highlight_footer')
      if (!highlightContainer || !footer) return

      const getTextY = (): number => footer.getBoundingClientRect().bottom
      const getContainerY = (): number =>
        highlightContainer.getBoundingClientRect().bottom

      let widthPercent = 100

      // We are gradually decreasing the width of the container until the text bottom spacing is reduced in the container
      while (getContainerY() - getTextY() > 25) {
        widthPercent = widthPercent - 2
        highlightContainer.style.width = widthPercent + '%'
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Head>
        {props.previewImageFileName && (
          <meta
            name="omnivore:preview_image_destination"
            content={encodeURIComponent(props.previewImageFileName || '')}
          />
        )}
        {props.previewImageFileName && (
          <meta
            name="omnivore:preview_image_selector"
            content={encodeURIComponent('#selected_highlight_wrapper')}
          />
        )}
      </Head>
      {selectedHighlight && (
        <Box
          id="selected_highlight_wrapper"
          css={{
            aspectRatio: '1.91',
            maxWidth: '100%',
            padding: '20px',
          }}
        >
          <PublicHighlightView
            key={selectedHighlight.id}
            highlight={selectedHighlight}
            title={props.publicArticle.title}
            author={props.publicArticle.author}
          />

          <SpanBox id="selected_highlight_footer">
            <HighlightFooter
              title={props.publicArticle.title}
              author={props.publicArticle.author}
              site={articleSite}
              fontSize="16px"
            />
          </SpanBox>
        </Box>
      )}
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
      if (!selectedHighlight) {
        return { notFound: true }
      }

      const previewImageMeta = {
        highlightsCount: publicArticle.highlights.length,
        annotationsCount: publicArticle.highlights.filter((h) => !!h.annotation)
          .length,
        quote: selectedHighlight?.quote,
        prefix: selectedHighlight?.prefix,
        suffix: selectedHighlight?.suffix,
        annotation: selectedHighlight?.annotation,
      }
      const previewImageHash = objectToHash(previewImageMeta)
      const previewImageFileName = `${username}/${slug}/highlights/${selectedHighlightId}/preview_${previewImageHash}.png`

      return {
        props: {
          username,
          publicArticle,
          selectedHighlightId,
          previewImageFileName,
          showAllHighlights: false,
        },
      }
    } else {
      throw new Error('public article query failed')
    }
  } catch (error) {
    captureException(error)
    // Flushing before returning is necessary if deploying to Vercel, see
    // https://vercel.com/docs/platform/limits#streaming-responses
    await flush(2000)
    return { notFound: true }
  }
}
