import { useRouter } from 'next/router'
import { applyStoredTheme } from '../../../lib/themeUpdater'
import { useMemo } from 'react'
import {
  Box,
  HStack,
  SpanBox,
} from '../../../components/elements/LayoutPrimitives'
import { useGetLibraryItemContent } from '../../../lib/networking/library_items/useLibraryItems'

type ArticleAttribute = {
  name: string
  value: string
}

export default function Debug(): JSX.Element {
  const router = useRouter()
  const { data: article } = useGetLibraryItemContent(
    router.query.username as string,
    router.query.slug as string
  )

  applyStoredTheme()

  const sortedAttributes = useMemo(() => {
    // if (!sortedAttributes) {
    //   return []
    // }
    // return sortedAttributes.sort((a, b) =>
    //   a.createdAt.localeCompare(b.createdAt)
    // )
    if (!article) {
      return []
    }
    const result: ArticleAttribute[] = []

    result.push({ name: 'id', value: article.id })
    result.push({ name: 'linkId', value: article.linkId })

    result.push({ name: 'title', value: article.title })
    result.push({ name: 'url', value: article.url })
    result.push({ name: 'slug', value: article.slug })

    result.push({ name: 'folder', value: article.folder })

    result.push({ name: 'state', value: article.state ?? 'null' })

    result.push({
      name: 'originalArticleUrl',
      value: article.originalArticleUrl,
    })
    result.push({ name: 'author', value: article.author ?? 'null' })
    result.push({ name: 'siteName', value: article.siteName ?? 'null' })

    result.push({ name: 'image', value: article.image ?? 'null' })
    result.push({ name: 'savedAt', value: article.savedAt })
    result.push({ name: 'createdAt', value: article.createdAt })
    result.push({ name: 'publishedAt', value: article.publishedAt ?? 'null' })
    result.push({ name: 'description', value: article.description ?? 'null' })

    result.push({
      name: 'wordsCount',
      value: article.wordsCount?.toString() ?? 'null',
    })

    result.push({ name: 'contentReader', value: article.contentReader })

    result.push({
      name: 'readingProgressPercent',
      value: article.readingProgressPercent.toString(),
    })
    result.push({
      name: 'readingProgressTopPercent',
      value: article.readingProgressTopPercent?.toString() ?? 'null',
    })
    result.push({
      name: 'readingProgressAnchorIndex',
      value: article.readingProgressAnchorIndex?.toString() ?? 'null',
    })

    result.push({
      name: 'savedByViewer',
      value: article.savedByViewer?.toString() ?? 'null',
    })

    result.push({
      name: 'savedByViewer',
      value: article.savedByViewer?.toString() ?? 'null',
    })

    article.labels?.forEach((label, idx) => {
      result.push({
        name: `label[${idx}].id`,
        value: label.id,
      })
      result.push({
        name: `label[${idx}].name`,
        value: label.name,
      })
      result.push({
        name: `label[${idx}].createdAt`,
        value: label.createdAt.toString(),
      })
    })

    article.highlights?.forEach((highlight, idx) => {
      result.push({ name: `highlight[${idx}].id`, value: highlight.id })
      result.push({ name: `highlight[${idx}].type`, value: highlight.type })
      result.push({
        name: `highlight[${idx}].shortId`,
        value: highlight.shortId,
      })
      result.push({
        name: `highlight[${idx}].color`,
        value: highlight.color ?? 'null',
      })
      result.push({
        name: `highlight[${idx}].createdAt`,
        value: highlight.createdAt,
      })
      result.push({
        name: `highlight[${idx}].updatedAt`,
        value: highlight.updatedAt,
      })
      result.push({
        name: `highlight[${idx}].createdByMe`,
        value: highlight.createdByMe.toString(),
      })

      result.push({
        name: `highlight[${idx}].quote`,
        value: highlight.quote ?? 'null',
      })
      result.push({
        name: `highlight[${idx}].patch`,
        value: highlight.patch ?? 'null',
      })
      result.push({
        name: `highlight[${idx}].annotation`,
        value: highlight.annotation ?? 'null',
      })

      result.push({
        name: `highlight[${idx}].highlightPositionPercent`,
        value: highlight.highlightPositionPercent?.toString() ?? 'null',
      })
      result.push({
        name: `highlight[${idx}].highlightPositionPercent`,
        value: highlight.highlightPositionAnchorIndex?.toString() ?? 'null',
      })

      highlight.labels?.forEach((label, labelIdx) => {
        result.push({
          name: `highlight[${idx}].labels[${labelIdx}].id`,
          value: label.id,
        })
        result.push({
          name: `highlight[${idx}].labels[${labelIdx}].name`,
          value: label.name,
        })
        result.push({
          name: `highlight[${idx}].labels[${labelIdx}].createdAt`,
          value: label.createdAt.toString(),
        })
      })
    })
    // content: string
    // highlights: Highlight[]
    // labels?: Label[]
    // recommendations?: Recommendation[]

    return result
  }, [article])

  return (
    <>
      <Box
        css={{
          backgroundColor: '$grayBgActive',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderBottom: 'unset',
          alignItems: 'center',
          padding: '50px',
          borderRadius: '5px 5px 0px 0px',
          width: '100%',
        }}
      >
        {sortedAttributes.map((attribute, idx) => {
          return (
            <HStack
              key={`attribute-${idx}`}
              alignment="start"
              distribution="start"
              css={{ padding: '10px', border: '1px solid black' }}
            >
              <SpanBox css={{ marginRight: '50px' }}>{attribute.name}</SpanBox>
              <SpanBox
                css={{
                  color: '$grayTextContrast',
                  marginLeft: 'auto',
                }}
              >
                {attribute.value}
              </SpanBox>
            </HStack>
          )
        })}
      </Box>
    </>
  )
}
