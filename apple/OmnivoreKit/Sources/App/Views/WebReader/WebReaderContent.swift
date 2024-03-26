import Foundation
import Models
import Utils
import Views

struct WebReaderContent {
  let textFontSize: Int
  let lineHeight: Int
  let maxWidthPercentage: Int
  let item: LibraryItem
  let isDark: Bool
  let themeKey: String
  let fontFamily: WebFont
  let articleContent: ArticleContent
  let prefersHighContrastText: Bool
  let enableHighlightOnRelease: Bool
  let justifyText: Bool

  init(
    item: Models.LibraryItem,
    articleContent: ArticleContent,
    isDark: Bool,
    fontSize: Int,
    lineHeight: Int,
    maxWidthPercentage: Int,
    fontFamily: WebFont,
    prefersHighContrastText: Bool,
    enableHighlightOnRelease: Bool,
    justifyText: Bool
  ) {
    self.textFontSize = fontSize
    self.lineHeight = lineHeight
    self.maxWidthPercentage = maxWidthPercentage
    self.item = item
    self.isDark = isDark
    self.themeKey = ThemeManager.currentTheme.themeKey
    self.fontFamily = fontFamily
    self.articleContent = articleContent
    self.prefersHighContrastText = prefersHighContrastText
    self.enableHighlightOnRelease = enableHighlightOnRelease
    self.justifyText = justifyText
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
            @import url("highlight\(isDark ? "-dark" : "").css");
          </style>
          <style>
            body {
              -webkit-text-size-adjust: 100%;
            }
            .is-sticky {
              right: 20px !important;
              bottom: 60px !important;
            }
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
            contentReader: "\(item.contentReader ?? "WEB")",
            readingProgressPercent: \(item.readingProgress),
            readingProgressAnchorIndex: \(item.readingProgressAnchor),
            labels: \(item.labelsJSONString),
            highlights: \(articleContent.highlightsJSONString),
            recommendations: \(item.recommendationsJSONString),
          }

          window.themeKey = "\(themeKey)"
          window.fontSize = \(textFontSize)
          window.fontFamily = "\(fontFamily.rawValue)"
          window.maxWidthPercentage = \(maxWidthPercentage)
          window.lineHeight = \(lineHeight)
          window.justifyText = \(justifyText)
          window.prefersHighContrastFont = \(prefersHighContrastText)
          window.enableHighlightBar = \(isMacApp)
          window.highlightOnRelease = \(enableHighlightOnRelease)
        </script>
        <script src="bundle.js"></script>
        <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
        <script src="mathjax.js" id="MathJax-script"></script>
      </body>
    </html>
    """
  }

  // swiftlint:disable line_length function_body_length
  static func emptyContent(isDark: Bool) -> String {
    let themeKey = ThemeManager.currentTheme.themeKey
    return """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
          <style>
            @import url("highlight\(isDark ? "-dark" : "").css");
          </style>
      </head>
      <body>
        <div id="root" />
        <div id='_omnivore-htmlContent' style="display: none;">

        </div>
        <script type="text/javascript">
          window.omnivoreEnv = {
            "NEXT_PUBLIC_APP_ENV": "prod",
            "NEXT_PUBLIC_BASE_URL": "unset",
            "NEXT_PUBLIC_SERVER_BASE_URL": "unset",
            "NEXT_PUBLIC_HIGHLIGHTS_BASE_URL": "unset"
          }

          window.omnivoreArticle = {
            id: "-1",
            linkId: "-1",
            slug: "none",
            createdAt: new Date(),
            savedAt: new Date(),
            publishedAt: new Date(),
            url: ``,
            title: ``,
            content: document.getElementById('_omnivore-htmlContent').innerHTML,
            originalArticleUrl: "",
            contentReader: "WEB",
            readingProgressPercent: 0,
            readingProgressAnchorIndex: 0,
            labels: [],
            highlights: [],
            recommendations: [],
          }

          window.fontSize = 0
          window.fontFamily = "Inter"
          window.maxWidthPercentage = 0
          window.lineHeight = 1.25
          window.themeKey = "\(themeKey)"
          window.prefersHighContrastFont = true
          window.enableHighlightBar = false
          window.highlightOnRelease = false
        </script>
        <script src="bundle.js"></script>
        <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
        <script src="mathjax.js" id="MathJax-script"></script>
      </body>
    </html>
    """
  }
}
