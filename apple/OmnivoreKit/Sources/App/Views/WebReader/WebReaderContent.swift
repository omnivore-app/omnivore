import Foundation
import Models
import Utils

struct WebReaderContent {
  let textFontSize: Int
  let content: String
  let item: FeedItem
  let themeKey: String
  let authToken: String

  init(
    htmlContent: String,
    item: FeedItem,
    authToken: String,
    isDark: Bool,
    fontSize: Int
  ) {
    self.textFontSize = fontSize
    self.content = htmlContent
    self.item = item
    self.themeKey = isDark ? "Gray" : "LightGray"
    self.authToken = authToken
  }

  // swiftlint:disable line_length
  var styledContent: String {
    """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
        <style>
            @import url("fonts.css");
        </style>
      </head>
      <body>
        <div id="root">
          <script type="text/javascript">
            function loadArticle() {
              window.omnivoreArticle = {
                id: "test",
                linkId: "test",
                slug: "test-slug",
                createdAt: new Date().toISOString(),
                savedAt: new Date().toISOString(),
                url: "https://example.com",
                title: `\(item.title)`,
                content: `\(content)`,
                originalArticleUrl: "https://example.com",
                contentReader: "WEB",
                readingProgressPercent: \(item.readingProgress),
                readingProgressAnchorIndex: \(item.readingProgressAnchor),
                highlights: [],
              }
            }

            loadArticle()
            window.fontSize = \(textFontSize)
            window.localStorage.setItem("authToken", "\(authToken)")
            window.localStorage.setItem("theme", "\(themeKey)")
          </script>
        </div>
        <script src="bundle.js"></script>
      </body>
    </html>
    """
  }
}
