import Foundation
import Models
import Utils
import Views

struct WebReaderContent {
  let textFontSize: Int
  let lineHeight: Int
  let maxWidthPercentage: Int
  let item: LinkedItem
  let themeKey: String
  let fontFamily: WebFont
  let articleContent: ArticleContent

  init(
    item: LinkedItem,
    articleContent: ArticleContent,
    isDark: Bool,
    fontSize: Int,
    lineHeight: Int,
    maxWidthPercentage: Int,
    fontFamily: WebFont
  ) {
    self.textFontSize = fontSize
    self.lineHeight = lineHeight
    self.maxWidthPercentage = maxWidthPercentage
    self.item = item
    self.themeKey = isDark ? "Gray" : "LightGray"
    self.fontFamily = fontFamily
    self.articleContent = articleContent
  }

  // swiftlint:disable line_length
  var styledContent: String {
    let savedAt = "new Date(\(item.unwrappedSavedAt.timeIntervalSince1970 * 1000)).toISOString()"
    let createdAt = "new Date(\(item.unwrappedCreatedAt.timeIntervalSince1970 * 1000)).toISOString()"
    let publishedAt = item.publishDate != nil ? "new Date(\(item.publishDate!.timeIntervalSince1970 * 1000)).toISOString()" : "undefined"

    return """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
          <style>
            @import url("highlight\(themeKey == "Gray" ? "-dark" : "").css");
          </style>
      </head>
      <body>
        <div id="root" />
        <div id='_omnivore-htmlContent' style="display: none;">
          \(articleContent.htmlContent)
        </div>
        <script type="text/javascript">
          window.omnivoreEnv = {
            "NEXT_PUBLIC_APP_ENV": "prod",
            "NEXT_PUBLIC_BASE_URL": "unset",
            "NEXT_PUBLIC_SERVER_BASE_URL": "unset",
            "NEXT_PUBLIC_HIGHLIGHTS_BASE_URL": "unset"
          }

          window.omnivoreArticle = {
            id: "\(item.unwrappedID)",
            linkId: "\(item.unwrappedID)",
            slug: "\(item.unwrappedSlug)",
            createdAt: \(createdAt),
            savedAt: \(savedAt),
            publishedAt: \(publishedAt),
            url: `\(item.unwrappedPageURLString)`,
            title: `\(articleContent.title.replacingOccurrences(of: "`", with: "\\`"))`,
            content: document.getElementById('_omnivore-htmlContent').innerHTML,
            originalArticleUrl: "\(item.unwrappedPageURLString)",
            contentReader: "WEB",
            readingProgressPercent: \(item.readingProgress),
            readingProgressAnchorIndex: \(item.readingProgressAnchor),
            labels: \(item.labelsJSONString),
            highlights: \(articleContent.highlightsJSONString),
          }

          window.fontSize = \(textFontSize)
          window.fontFamily = "\(fontFamily.rawValue)"
          window.maxWidthPercentage = \(maxWidthPercentage)
          window.lineHeight = \(lineHeight)
          window.localStorage.setItem("theme", "\(themeKey)")
        </script>
        <script src="bundle.js"></script>
        <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
        <script src="mathjax.js" id="MathJax-script"></script>
      </body>
    </html>
    """
  }
}
