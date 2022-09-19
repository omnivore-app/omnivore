package app.omnivore.omnivore.ui.reader

import android.util.Log
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
    val savedAt = "new Date(1662571290735.0).toISOString()"
    val createdAt = "new Date().toISOString()"
    val publishedAt = "new Date().toISOString()" //if (item.publishDate != null) "new Date((item.publishDate!.timeIntervalSince1970 * 1000)).toISOString()" else "undefined"

    val rrrr = """
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
              <div id='_omnivore-htmlContent'>
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
                  createdAt: new Date(1662571290735.0).toISOString(),
                  savedAt: new Date(1662571290981.0).toISOString(),
                  publishedAt: new Date(1662454816000.0).toISOString(),
                  url: `${item.pageURLString}`,
                  title: `${articleContent.title.replace("`", "\\`")}`,
                  content: document.getElementById('_omnivore-htmlContent').innerHTML,
                  originalArticleUrl: "${item.pageURLString}",
                  contentReader: "WEB",
                  readingProgressPercent: ${item.readingProgress},
                  readingProgressAnchorIndex: ${item.readingProgressAnchor},
                  labels: "[]",
                  highlights: "[]",
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

    Log.d("Loggo", rrrr)

    return rrrr
  }
}
