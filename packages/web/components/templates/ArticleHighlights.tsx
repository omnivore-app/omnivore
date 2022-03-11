import { useRouter } from 'next/router'
import { PublicArticleAttributes } from '../../lib/networking/queries/useGetPublicArticleQuery'
import { PrimaryLayout } from './PrimaryLayout'
import { StyledText } from '../elements/StyledText'
import { VStack, HStack, Box } from '../elements/LayoutPrimitives'
import { authoredByText } from '../patterns/ArticleSubtitle'
import Image from 'next/image'
import { HighlightFooter, PublicHighlightView } from '../patterns/HighlightView'
import { useMemo, useRef, useState } from 'react'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { Button } from '../elements/Button'

type ArticleHighlightsProps = {
  publicArticle: PublicArticleAttributes
  showAllHighlights: boolean
  selectedHighlightId?: string
  previewImagePath?: string
}

export function ArticleHighlights(props: ArticleHighlightsProps): JSX.Element {
  const router = useRouter()
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: props.publicArticle.title,
        description: props.publicArticle.description,
        path: router.pathname,
        ogImage: props.previewImagePath,
        ogImageType: 'image/png',
      }}
      pageTestId={router.pathname}
    >
      <VStack alignment="center" css={{ width: '100%' }}>
        <LoadedContent
          publicArticle={props.publicArticle}
          showAllHighlights={props.showAllHighlights}
          selectedHighlightId={props.selectedHighlightId}
        />
      </VStack>
    </PrimaryLayout>
  )
}

type LoadedContentProps = {
  publicArticle: PublicArticleAttributes
  showAllHighlights: boolean
  selectedHighlightId?: string
}

function LoadedContent(props: LoadedContentProps): JSX.Element {
  const router = useRouter()
  const container = useRef<HTMLDivElement>(null)

  const [showAllHighlights, setShowAllHighlights] = useState(
    props.showAllHighlights
  )

  const selectedHighlights =
    props.publicArticle.highlights.filter((highlight) => {
      return highlight.shortId === props.selectedHighlightId
    }) ?? ([] as Highlight[])

  const unselectedHighlights =
    props.publicArticle.highlights.filter((highlight) => {
      return highlight.shortId !== props.selectedHighlightId
    }) ?? ([] as Highlight[])

  const moreHighlightsCount = useMemo(() => {
    return props.publicArticle.highlights.length - 1
  }, [props.publicArticle.highlights])

  const sharedBy = useMemo(() => {
    if (moreHighlightsCount < 1) return undefined
    return props.publicArticle.highlights[0].user
  }, [moreHighlightsCount, props.publicArticle.highlights])

  const articleSite = useMemo(() => {
    try {
      const url = new URL(props.publicArticle.url)
      return url.hostname
    } catch (e) {
      console.log('error ', e)
      return ''
    }
  }, [props.publicArticle.url])

  return (
    <VStack
      alignment="center"
      css={{
        p: props.selectedHighlightId ? '66px $3 0px $3' : '0px $3 0px $3',
        width: '66%',
        maxWidth: '600px',
        mb: '$4',
        '@smDown': {
          p: '32px $3 0px $3',
          width: '100%',
        },
        aspectRatio: router.query.adjustAspectRatio as string,
      }}
      ref={container}
    >
      {!props.selectedHighlightId && (
        <LinkedItem publicArticle={props.publicArticle} />
      )}

      {selectedHighlights.map((highlight) => (
        <PublicHighlightView
          key={highlight.id}
          highlight={highlight}
          title={props.publicArticle.title}
          author={props.publicArticle.author}
        />
      ))}

      {showAllHighlights &&
        unselectedHighlights.map((highlight) => (
          <PublicHighlightView key={highlight.id} highlight={highlight} />
        ))}

      <HighlightFooter
        title={props.publicArticle.title}
        author={props.publicArticle.author}
        site={articleSite}
      />

      {!showAllHighlights && moreHighlightsCount > 0 && sharedBy && (
        <Button onClick={() => setShowAllHighlights(true)}>
          <Box
            css={{ width: '8px', color: '$grayBackground', mr: '4px' }}
            className="dropdown-arrow"
          />
          Read {moreHighlightsCount} more highlight
          {moreHighlightsCount > 1 ? 's ' : ' '}
          from {sharedBy.name}
        </Button>
      )}

      <Button
        style="ctaDarkYellow"
        css={{ m: '44px', p: '14px 16px', alignSelf: 'center' }}
        onClick={() => {
          if (window !== undefined) {
            window.open(props.publicArticle.url, '_blank')
          }
        }}
      >
        Read Original
      </Button>
    </VStack>
  )
}

type LinkedItemProps = {
  publicArticle: PublicArticleAttributes
}

function LinkedItem(props: LinkedItemProps): JSX.Element {
  const originText = new URL(props.publicArticle.url).hostname

  return (
    <VStack
      alignment="start"
      css={{
        bg: '$grayBgActive',
        borderRadius: '$2',
        p: '$2',
        width: '100%',
      }}
    >
      <HStack distribution="start" css={{ width: '100%' }}>
        <HStack distribution="start" alignment="start">
          <Box>
            <Image
              src={
                '/static/images/linked-item-card-placeholder.png'
                // props.image ?? '/static/images/linked-item-card-placeholder.png'
              }
              alt="Link Preview Image"
              layout="fixed"
              width={88}
              height={88}
            />
          </Box>

          <VStack
            distribution="start"
            alignment="start"
            css={{ px: '$2', flexGrow: 1 }}
          >
            <StyledText
              style="caption"
              css={{ my: '$1', textAlign: 'left', overflow: 'auto' }}
            >
              {props.publicArticle.title}
            </StyledText>
            {props.publicArticle.author && (
              <StyledText style="caption" css={{ my: '$1' }}>
                {authoredByText(props.publicArticle.author)}
              </StyledText>
            )}
            <StyledText style="caption" css={{ my: '$1' }}>
              {originText}
            </StyledText>
          </VStack>
        </HStack>
      </HStack>

      <StyledText
        style="caption"
        css={{ m: 0, py: '$2', height: '5em', overflow: 'hidden' }}
      >
        {props.publicArticle.description}
      </StyledText>
    </VStack>
  )
}
