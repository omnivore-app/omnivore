package app.omnivore.omnivore.feature.reader

import android.util.Log
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.Highlight
import com.google.gson.Gson

enum class WebFont(val displayText: String, val rawValue: String) {
  INTER("Inter", "Inter"),
  SYSTEM("System Default", "system-ui"),
  OPEN_DYSLEXIC("Open Dyslexic", "OpenDyslexic"),
  MERRIWEATHER("Merriweather", "Merriweather"),
  LORA("Lora", "Lora"),
  OPEN_SANS("Open Sans", "Open Sans"),
  ROBOTO("Roboto", "Roboto"),
  CRIMSON_TEXT("Crimson Text", "Crimson Text"),
  SOURCE_SERIF_PRO("Source Serif Pro", "Source Serif Pro"),
  NEWSREADER("Newsreader", "Newsreader"),
  LEXEND("Lexend", "Lexend"),
  LXGWWENKAI("LXGW WenKai", "LXGWWenKai"),
  ATKINSON_HYPERLEGIBLE("Atkinson Hyperlegible", "AtkinsonHyperlegible"),
  SOURCE_SANS_PRO("Source Sans Pro", "SourceSansPro"),
  IBM_PLEX_SANS("IBM Plex Sans", "IBMPlexSans"),
  LITERATA("Literata", "Literata"),
  FRAUNCES("Fraunces", "Fraunces"),
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
  val highlights: List<Highlight>,
  val contentStatus: String, // ArticleContentStatus,
  val objectID: String?, // whatever the Room Equivalent of objectID is
  val labelsJSONString: String
) {
  fun highlightsJSONString(): String {
    return Gson().toJson(highlights)
  }
}

data class WebReaderContent(
  val preferences: WebPreferences,
  val item: SavedItem,
  val articleContent: ArticleContent,
) {
  fun styledContent(): String {
    val savedAt = "\"${item.savedAt}\""
    val createdAt = "\"${item.createdAt}\""
    val publishedAt = if (item.publishDate != null) "\"${item.publishDate}\"" else "undefined"


    val textFontSize = preferences.textFontSize
    val highlightCssFilePath = "highlight${if (preferences.themeKey == "Dark") "-dark" else ""}.css"

    Log.d("theme", "current theme is: ${preferences.themeKey}")

    Log.d("sync", "HIGHLIGHTS JSON:  ${articleContent.highlightsJSONString()}")

    return """
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
                <style>
                  @import url("$highlightCssFilePath");
                   
                        body {
                        overflow-y: hidden !important; /* Disable horizontal scrolling */
                        overflow-x: hidden !important; /* Disable horizontal scrolling */


                    }
                   .container {
                    height: 100vh !important;
                    padding-top: 50px;
                    padding-bottom: 10px;
                    column-width: 100vw; 
                    column-gap: 0px;
                    display: inline-block; 
                    overflow-x: auto; 
                    bottom: 0px !important;
                    transform: translateY(0vh) !important;

                    

                }
                   
      #scrollButtonForward {
      position: fixed !important;
      bottom: 50% !important;
      right: 0 !important;
      height: 200px !important;
      width: 70px;
      transform: translateY(100px) !important;
      background-color: transparent !important; /* Adjust the color as needed */
      color: #DDDDDD !important; /* Adjust the color as needed */
      padding: 5px !important;
      cursor: pointer !important;
      z-index: 1000 !important; /* Adjust the z-index as needed */
      font-size: 40px !important; /* Adjust the font size as needed */
      display: flex !important;
      justify-content: right !important;
      align-items: center !important;
    }
    
      #scrollButtonBack {
      position: fixed !important;
      bottom: 50% !important;
      left: 0 !important;
      height: 200px !important;
      width: 70px;
      transform: translateY(100px) !important;
      background-color: transparent !important; /* Adjust the color as needed */
      color: #DDDDDD !important; /* Adjust the color as needed */
      padding: 5px !important;
      cursor: pointer !important;
      z-index: 1000 !important; /* Adjust the z-index as needed */
      font-size: 40px !important; /* Adjust the font size as needed */
      display: flex !important;
      justify-content: left !important;
      align-items: center !important;
    }
      
    }
                    
                </style>
            </head>
             <div id="scrollButtonForward" onclick="scrollForward()">»</div>
             <div id="scrollButtonBack" onclick="scrollBack()">«</div>

            <body>
              <div id="root" class="container" />
              <div id='_omnivore-htmlContent'; class="column">
                ${articleContent.htmlContent}
              </div>
               

              
              <script type="text/javascript">
              
              function scrollForward() {
      document.getElementById("root").scrollLeft += window.innerWidth;
    }
                  function scrollBack() {
      document.getElementById("root").scrollLeft -= window.innerWidth;
    }

                window.omnivoreEnv = {
                  "NEXT_PUBLIC_APP_ENV": "prod",
                  "NEXT_PUBLIC_BASE_URL": "unset",
                  "NEXT_PUBLIC_SERVER_BASE_URL": "unset",
                  "NEXT_PUBLIC_HIGHLIGHTS_BASE_URL": "unset"
                }

                window.omnivoreArticle = {
                  id: "${item.savedItemId}",
                  linkId: "${item.savedItemId}",
                  slug: "${item.slug}",
                  createdAt: ${createdAt},
                  savedAt: ${savedAt},
                  publishedAt: ${publishedAt},
                  url: `${item.pageURLString}`,
                  title: `${articleContent.title.replace("`", "\\`")}`,
                  content: document.getElementById('_omnivore-htmlContent').innerHTML,
                  originalArticleUrl: "${item.publisherURLString}",
                  contentReader: "WEB",
                  readingProgressPercent: ${item.readingProgress},
                  readingProgressAnchorIndex: ${item.readingProgressAnchor},
                  labels: ${articleContent.labelsJSONString},
                  highlights: ${articleContent.highlightsJSONString()},
                }

                window.themeKey = "${preferences.themeKey}"
                window.fontSize = $textFontSize
                window.fontFamily = "${preferences.fontFamily.rawValue}"
                window.maxWidthPercentage = ${preferences.maxWidthPercentage}
                window.lineHeight = ${preferences.lineHeight}
                window.prefersHighContrastFont = ${preferences.prefersHighContrastText}
                window.justifyText = ${preferences.prefersJustifyText}
                window.enableHighlightBar = false
              </script>  
              
              
              
              <script src="bundle.js"></script>
              <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
              <script src="mathjax.js" id="MathJax-script"></script>
            </body>
          </html>
    """
  }
}
