import Foundation
import Models
import Utils

struct WebReaderContent {
  let textFontSize: Int
  let articleContent: ArticleContent
  let item: FeedItem
  let themeKey: String
  let authToken: String
  let appEnv: AppEnvironment

  init(
    articleContent: ArticleContent,
    item: FeedItem,
    authToken: String,
    isDark: Bool,
    fontSize: Int,
    appEnv: AppEnvironment
  ) {
    self.textFontSize = fontSize
    self.articleContent = articleContent
    self.item = item
    self.themeKey = isDark ? "Gray" : "LightGray"
    self.authToken = authToken
    self.appEnv = appEnv
  }

  // swiftlint:disable line_length
  var styledContent: String {
    """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
      </head>
      <body>
        <div id="root" />
        <div id='_omnivore-htmlContent' style="display: none;">
          \(articleContent.htmlContent)
        </div>
        <div id='_omnivore-title' style="display: none;">
          \(item.title)
        </div>
        <script type="text/javascript">
          window.omnivoreEnv = {
            "NEXT_PUBLIC_APP_ENV": "\(appEnv.rawValue)",
            "NEXT_PUBLIC_\(appEnv.rawValue.uppercased())_BASE_URL": "\(appEnv.webAppBaseURL.absoluteString)",
            "NEXT_PUBLIC_\(appEnv.rawValue.uppercased())_SERVER_BASE_URL": "\(appEnv.serverBaseURL.absoluteString)",
            "NEXT_PUBLIC_\(appEnv.rawValue.uppercased())_HIGHLIGHTS_BASE_URL": "\(appEnv.highlightsServerBaseURL.absoluteString)"
          }

          window.omnivoreArticle = {
            id: "\(item.id)",
            linkId: "\(item.id)",
            slug: "\(item.slug)",
            createdAt: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            url: `\(item.pageURLString)`,
            title: document.getElementById('_omnivore-title').innerHTML,
            content: document.getElementById('_omnivore-htmlContent').innerHTML,
            originalArticleUrl: "\(item.pageURLString)",
            contentReader: "WEB",
            readingProgressPercent: \(item.readingProgress),
            readingProgressAnchorIndex: \(item.readingProgressAnchor),
            highlights: \(articleContent.highlightsJSONString),
          }

          window.fontSize = \(textFontSize)
          window.localStorage.setItem("authToken", "\(authToken)")
          window.localStorage.setItem("theme", "\(themeKey)")
        </script>
        <script src="bundle.js"></script>

      </body>
    </html>
    """
  }
}
