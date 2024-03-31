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
        val highlightCssFilePath =
            "highlight${if (preferences.themeKey == "Dark") "-dark" else ""}.css"

        Log.d("theme", "current theme is: ${preferences.themeKey}")

        Log.d("sync", "HIGHLIGHTS JSON:  ${articleContent.highlightsJSONString()}")

        return """
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
    />
    <style>
      @import url("$highlightCssFilePath");
      
      #preloader{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999; /* Ensure it's above other content */ 
      }   
      
      body {
        overflow-y: hidden !important; /* Disable horizontal scrolling */
        overflow-x: hidden !important; /* Disable horizontal scrolling */
        height: 100vh !important;
        background-color: var(--colors-readerBg);
      }
      
      .container {
        overflow-x: auto;
        display: inline-block;
        height: 100vh !important;
        padding-top: 52px;
        padding-bottom: 20px;
        column-width: 100vw;
        column-gap: 0px;
        bottom: 0px;
        background-color: var(--colors-readerBg);
      }
      
       img {
        max-height: 80vh; 
        max-width: 100%; 
        height: auto; 
        width: auto; 
        }


        #pagination {
            position: fixed !important;
            bottom: 10px !important;
            right: 10px !important;
            padding: 5px !important;
            color: var(--font-color) !important;
            z-index: 1000 !important; 
            font-size: 0.7rem !important; 
        }

        
#buttonWrapper {
    display: none;
    background-color: inherit;
    border-radius: 10px;
    padding: 20px;
    margin: 10px auto; /* Center the wrapper */
    position: fixed;
    bottom: 5vh;
    left: 0;
    right: 0;
    z-index: 1000;
    justify-content: space-between;
    
}

   


.buttonContainer {
    width: 33%; 
    display: flex;
    justify-content: center; /* Center button in the container */
    
}


.popButton {
    background: none;
    border: none;
    color: var(--font-color); /* Button text color */
    font-size: 16px; /* Adjust as needed */
    padding: 10px;
    cursor: pointer;
    width:100%;
}
.vertical-line {
    width: 1px; /* thickness of the line */
    height: auto; /* height of the line */
    background-color: var(--font-color); /* color of the line */
    display: flex;
    justify-content: center; /* Center button in the container */
}



    </style>
  </head>


  <div id="pagination"></div>

  <body>
    <div id="preloader">Loading <br> Content</div> 
    <div id="root" class="container" />
    <div id="_omnivore-htmlContent" class="column">
      ${articleContent.htmlContent}

      <div id="buttonWrapper">
      
        <div class="buttonContainer">
        <button class="popButton" onclick="performSavedItemAction('Delete')">Delete</button>
        </div>
        <div class="vertical-line"></div>        
        <div class="buttonContainer">
        <button class="popButton" onclick="performSavedItemAction('Archive')">Archive</button>
        </div>
        <div class="vertical-line"></div>        
        <div class="buttonContainer">
        <button class="popButton" onclick="performSavedItemAction('MarkRead')">Close</button>
        </div>

    </div>


    </div>

    

   

    <script type="text/javascript">
      window.omnivoreEnv = {
        NEXT_PUBLIC_APP_ENV: "prod",
        NEXT_PUBLIC_BASE_URL: "unset",
        NEXT_PUBLIC_SERVER_BASE_URL: "unset",
        NEXT_PUBLIC_HIGHLIGHTS_BASE_URL: "unset",
      };

      window.omnivoreArticle = {
        id: "${item.savedItemId}",
        linkId: "${item.savedItemId}",
        slug: "${item.slug}",
        createdAt: ${createdAt},
        savedAt: ${savedAt},
        publishedAt: ${publishedAt},
        url: `${item.pageURLString}`,
        title: `${articleContent.title.replace("`", "\\`")}`,
        content: document.getElementById("_omnivore-htmlContent").innerHTML,
        originalArticleUrl: "${item.publisherURLString}",
        contentReader: "WEB",
        readingProgressPercent: ${item.readingProgress},
        readingProgressAnchorIndex: ${item.readingProgressAnchor},
        labels: ${articleContent.labelsJSONString},
        highlights: ${articleContent.highlightsJSONString()},
      };
      window.themeKey = "${preferences.themeKey}";
      window.fontSize = $textFontSize;
      window.fontFamily = "${preferences.fontFamily.rawValue}";
      window.maxWidthPercentage = ${preferences.maxWidthPercentage};
      window.lineHeight = ${preferences.lineHeight};
      window.prefersHighContrastFont = ${preferences.prefersHighContrastText};
      window.justifyText = ${preferences.prefersJustifyText};
      window.enableHighlightBar = false;
    </script>
    
    <script src="bundle.js"></script>
    <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
    <script src="mathjax.js" id="MathJax-script"></script>
    <script type="text/javascript" src="eink.js"></script>

  </body>
</html>
    """
    }
}
