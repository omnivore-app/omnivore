import React from "react";
import ReactDOM from "react-dom";
import { Box, VStack } from '@omnivore/web/components/elements/LayoutPrimitives'
import { ArticleContainer } from '@omnivore/web/components/templates/article/ArticleContainer'
import { ArticleAttributes } from "@omnivore/web/lib/networking/queries/useGetArticleQuery";
import '@omnivore/web/styles/globals.css'
import '@omnivore/web/styles/articleInnerStyling.css'

const App = () => {
  var themeId = window.localStorage.getItem('theme')

  if (themeId) {
    document.body.classList.remove(
      'theme-default',
      'White',
      'Gray',
      'LightGray',
      'Dark'
    )
    document.body.classList.add(themeId)
  }

  return (
    <>
      <Box
        css={{
          overflowY: 'auto',
          height: '100%',
          width: '100vw',
        }}
      >
        <VStack
          alignment="center"
          distribution="center"
          className="disable-webkit-callout"
        >
          <ArticleContainer
            viewerUsername="test"
            article={window.omnivoreArticle as ArticleAttributes}
            scrollElementRef={React.createRef()}
            isAppleAppEmbed={true}
            highlightBarDisabled={true}
            highlightsBaseURL="https://example.com"
            fontSize={window.fontSize ?? 18}
            margin={0}
          />
        </VStack>
      </Box>
    </>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
