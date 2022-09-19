package app.omnivore.omnivore.ui.reader

import app.omnivore.omnivore.models.LinkedItem

enum class WebFont(val displayText: String, val rawValue: String) {
  INTER("Inter", "Inter"),
  SYSTEM("System Default", "unset"),
  OPEN_DYSLEXIC("Open Dyslexic", "OpenDyslexic"),
  MERRIWEATHER("Merriweather", "Merriweather"),
  LORA("Lora", "Lora"),
  OPEN_SANS("Open Sans", "Open Sans"),
  ROBOTO("Roboto", "Roboto"),
  CRIMSON_TEXT("Crimson Text", "Crimson Text"),
  SOURCE_SERIF_PRO("Source Serif Pro", "Source Serif Pro"),
  Inter("Inter", "Inter"),
}

enum class ArticleContentStatus(val rawValue: String) {
  FAILED("FAILED"),
  PROCESSING("PROCESSING"),
  SUCCEEDED("SUCCEEDED"),
  UNKNOWN("UNKNOWN")
}

data class ArticleContent(
  val title: String,
  val htmlContent: String,
  val highlightsJSONString: String,
  val contentStatus: String, // ArticleContentStatus,
  val objectID: String?, // whatever the Room Equivalent of objectID is
)

data class WebReaderContent(
  val textFontSize: Int,
  val lineHeight: Int,
  val maxWidthPercentage: Int,
  val item: LinkedItem,
  val themeKey: String,
  val fontFamily: WebFont,
  val articleContent: ArticleContent,
  val prefersHighContrastText: Boolean
) {
  fun styledContent(): String {
    // TODO: Kotlinize these three values (pasted from Swift)
    val savedAt = "new Date((item.unwrappedSavedAt.timeIntervalSince1970 * 1000)).toISOString()"
    val createdAt = "new Date((item.unwrappedCreatedAt.timeIntervalSince1970 * 1000)).toISOString()"
    val publishedAt = if (item.publishDate != null) "new Date((item.publishDate!.timeIntervalSince1970 * 1000)).toISOString()" else "undefined"

    return """
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
                <style>
                  @import url("highlight${if (themeKey == "Gray") "-dark" else ""}.css");
                </style>
            </head>
            <body>
              <div id="root" />
              <div>HIIIIII</div>
              <div id='_omnivore-htmlContent' style="display: none;">
                ${articleContent.htmlContent}
              </div>
              <script type="text/javascript">
                window.omnivoreEnv = {
                  "NEXT_PUBLIC_APP_ENV": "prod",
                  "NEXT_PUBLIC_BASE_URL": "unset",
                  "NEXT_PUBLIC_SERVER_BASE_URL": "unset",
                  "NEXT_PUBLIC_HIGHLIGHTS_BASE_URL": "unset"
                }

                window.omnivoreArticle = {
                  id: "${item.id}",
                  linkId: "${item.id}",
                  slug: "${item.slug}",
                  createdAt: $createdAt,
                  savedAt: $savedAt,
                  publishedAt: $publishedAt,
                  url: `${item.pageURLString}`,
                  title: `${articleContent.title.replace("`", "\\`")}`,
                  content: document.getElementById('_omnivore-htmlContent').innerHTML,
                  originalArticleUrl: "${item.pageURLString}",
                  contentReader: "WEB",
                  readingProgressPercent: ${item.readingProgress},
                  readingProgressAnchorIndex: ${item.readingProgressAnchor},
                  labels: ${item.labelsJSONString()},
                  highlights: ${articleContent.highlightsJSONString},
                }

                window.fontSize = $textFontSize
                window.fontFamily = "${fontFamily.rawValue}"
                window.maxWidthPercentage = $maxWidthPercentage
                window.lineHeight = $lineHeight
                window.localStorage.setItem("theme", "$themeKey")
                window.prefersHighContrastFont = $prefersHighContrastText
                window.enableHighlightBar = false
              </script>
              <script src="bundle.js"></script>
              <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
              <script src="mathjax.js" id="MathJax-script"></script>
            </body>
          </html>
    """.trimIndent()
  }
}
