import React from 'react'
import ReactDOM from 'react-dom'
import { Box, VStack } from '@omnivore/web/components/elements/LayoutPrimitives'
import { ArticleContainer } from '@omnivore/web/components/templates/article/ArticleContainer'
import { applyStoredTheme } from '@omnivore/web/lib/themeUpdater'
import '@omnivore/web/styles/globals.css'
import '@omnivore/web/styles/articleInnerStyling.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 4, // 4hrs
    },
  },
})

const mutation = async (name, input) => {
  if (window.webkit) {
    // Send iOS a message
    const result =
      await window?.webkit?.messageHandlers.articleAction?.postMessage({
        actionID: name,
        ...input,
      })
    return result.result
  } else {
    // Send android a message
    console.log('sending android a message', name, input)
    AndroidWebKitMessenger.handleIdentifiableMessage(
      name,
      JSON.stringify(input)
    )

    // TODO: handle errors
    switch (name) {
      case 'createHighlight':
        return input
      case 'deleteHighlight':
        return true
      case 'mergeHighlight':
        return {
          id: input['id'],
          type: input['type'],
          shortID: input['shortId'],
          quote: input['quote'],
          patch: input['patch'],
          createdByMe: true,
          labels: [],
        }
      case 'updateHighlight':
        return true
      case 'articleReadingProgress':
        return true
      default:
        return true
    }
  }
}

const App = () => {
  applyStoredTheme(false)

  const [pageTurn, setPageTurn] = React.useState(window.fullPageScroll ?? false)

  React.useEffect(() => {
    const doPageTurn = (clientX) => () => doubleClickPageTurn({ clientX })
    const togglePageTurn = ({ pageTurnSetting }) => setPageTurn(pageTurnSetting)
    const pageUp = doPageTurn(0)
    const pageDown = doPageTurn(window.innerWidth)

    document.addEventListener('omnivoreSetPageTurn', togglePageTurn)
    document.addEventListener('omnivorePageUp', pageUp)
    document.addEventListener('omnivorePageDown', pageDown)

    return () => {
      document.removeEventListener('omnivoreSetPageTurn', togglePageTurn)
      document.removeEventListener('omnivorePageUp', pageUp)
      document.removeEventListener('omnivorePageUp', pageDown)
    }
  })

  const doubleClickPageTurn = (e) => {
    if (pageTurn) {
      console.log("triggered")
      const scrollDirection = e.clientX > window.innerWidth / 2 ? 1 : -1
      window.scroll(0, window.scrollY + window.innerHeight * scrollDirection)

      // Once we've finished scrolling, we need to calculate an offset.
      const elementsIntersection = document.elementsFromPoint(
        window.innerWidth / 2,
        1
      )
      const paragraph = elementsIntersection.find(
        (el) =>
          el.tagName != 'DIV' && el.hasAttribute('data-omnivore-anchor-idx')
      )

      if (paragraph) {
        const lineHeight = parseInt(
          window.getComputedStyle(paragraph).getPropertyValue('line-height')
        )

        const { top } = paragraph.getBoundingClientRect()
        const diff = (top * -1) % lineHeight
        // If we are 70% of the way through the lineheight, we can likely read the entire text.
        // It would be annoying to show the user the same line again when they double tap. Instead, we should go down to the
        // next line.
        const offset = lineHeight * 0.7 < diff ? (lineHeight - diff) * -1 : diff
        window.scroll(0, window.scrollY - offset)
      }
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box
        css={{
          paddingTop: window.webkit ? 0 : '48px', // add 48px to android only
        }}
        onDoubleClick={doubleClickPageTurn}
      >
        <VStack
          alignment="center"
          distribution="center"
          className="disable-webkit-callout"
          style={{ backgroundColor: 'var(--colors-readerBg)' }}
        >
          <ArticleContainer
            article={window.omnivoreArticle}
            labels={window.omnivoreArticle.labels}
            isAppleAppEmbed={true}
            highlightBarDisabled={!window.enableHighlightBar}
            fontSize={window.fontSize ?? 18}
            fontFamily={window.fontFamily ?? 'inter'}
            margin={window.margin}
            maxWidthPercentage={window.maxWidthPercentage}
            lineHeight={window.lineHeight}
            highlightOnRelease={window.highlightOnRelease}
            highContrastText={window.prefersHighContrastFont ?? true}
            justifyText={window.justifyText}
            articleMutations={{
              createHighlightMutation: (input) =>
                mutation('createHighlight', input),
              deleteHighlightMutation: (libraryItemId, highlightId) =>
                mutation('deleteHighlight', { libraryItemId, highlightId }),
              mergeHighlightMutation: (input) =>
                mutation('mergeHighlight', input),
              updateHighlightMutation: (input) =>
                mutation('updateHighlight', input),
              articleReadingProgressMutation: (input) =>
                mutation('articleReadingProgress', input),
            }}
          />
        </VStack>
      </Box>
    </QueryClientProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
