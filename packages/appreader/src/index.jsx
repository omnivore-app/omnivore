import React from 'react'
import ReactDOM from 'react-dom'
import { Box, VStack } from '@omnivore/web/components/elements/LayoutPrimitives'
import { ArticleContainer } from '@omnivore/web/components/templates/article/ArticleContainer'
import { applyStoredTheme } from '@omnivore/web/lib/themeUpdater'
import '@omnivore/web/styles/globals.css'
import '@omnivore/web/styles/articleInnerStyling.css'

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

  return (
    <>
      <Box
        css={{
          // height: '100vh',
          // width: '100vw',
          paddingTop: window.webkit ? 0 : '48px', // add 48px to android only
        }}
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
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
