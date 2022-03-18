import Foundation
import Models
import Utils

struct WebReaderContent {
  let textFontSize: String
  let fontColor: String
  let fontColorTransparent: String
  let tableHeaderColor: String
  let headerColor: String
  let margin: String
  let content: String
  let item: FeedItem

  init(
    htmlContent: String,
    item: FeedItem,
    isDark: Bool = false,
    fontSize: String = "16px",
    margin: String = "24px"
  ) {
    self.textFontSize = fontSize
    self.fontColor = isDark ? "#B9B9B9" : "#3D3D3D"
    self.fontColorTransparent = isDark ? "rgba(185,185,185,0.65)" : "rgba(185,185,185,0.65)"
    self.tableHeaderColor = "#FFFFFF"
    self.headerColor = isDark ? "#B9B9B9" : "#3D3D3D"
    self.margin = margin
    self.content = htmlContent
    self.item = item
  }

  var styleString: String {
    // swiftlint:disable line_length
    "--text-font-size:\(textFontSize);--font-color:\(fontColor);--font-color-transparent\(fontColorTransparent);--table-header-color:\(tableHeaderColor);--headers-color:\(headerColor);--app-margin:\(margin);"
  }

  var styledContent: String {
    """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
      </head>
      <body>
        <div id="root" style="\(styleString)">
          <div>React App\(WebReaderResources.bundleURL)</div>
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
          </script>
        </div>
        <script src="bundle.js"></script>
      </body>
    </html>
    """
  }
}
