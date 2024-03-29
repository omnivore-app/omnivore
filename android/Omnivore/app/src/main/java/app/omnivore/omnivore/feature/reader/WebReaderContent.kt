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
      body {
        overflow-y: hidden !important; /* Disable horizontal scrolling */
        overflow-x: hidden !important; /* Disable horizontal scrolling */
        height: 100vh !important;

      }
      .container {
        overflow-x: auto;
        display: inline-block;
        height: 100vh !important;
        padding-top: 20px;
        padding-bottom: 20px;
        column-width: 100vw;
        column-gap: 0px;
        bottom: 0px;
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
        color: #7f7f7f !important;
        z-index: 1000 !important; 
        font-size: 0.7rem !important; 
      }
      

    </style>
  </head>


  <div id="pagination"></div>

  <body>
    <div id="root" class="container" />
    <div id="_omnivore-htmlContent" class="column">
      ${articleContent.htmlContent}
    </div>

    <script type="text/javascript">
        const container = document.getElementById("root");
        const paginationElement = document.getElementById("pagination");
        const initialReadingProgress = ${item.readingProgress}; // This should be a numeric value
        let currentPage; // Define currentPage in the global scope
        let initialPage; // Define initialPage in the global scope
        let totalPages; // Define totalPages in the global scope
        let averagedScrollingWidth;
        let currentScrollPosition = container.scrollLeft;
        let totalWidth;

        
        function calculatePagination() {
          const containerWidth = container.offsetWidth;
          totalWidth = container.scrollWidth - containerWidth;
          console.log("totalWidth:", totalWidth);
          currentScrollPosition = container.scrollLeft;
          totalPages = Math.round((totalWidth + containerWidth) / containerWidth);
          averagedScrollingWidth = (totalWidth + window.innerWidth) / totalPages;
          console.log("averagedScrollingWidth:", averagedScrollingWidth);
          currentPage = Math.round((container.scrollLeft + averagedScrollingWidth) / averagedScrollingWidth);
          paginationElement.textContent = currentPage + "/" + totalPages;
         }
        
        function scrollToInitialPage() {
        
          // Calculate the initial page based on the initialReadingProgress
          initialPage = Math.ceil((initialReadingProgress / 100) * totalPages);
          // Scroll to the initial page
          container.scrollLeft = (initialPage - 1) * averagedScrollingWidth;
          calculatePagination()
          setToolbar(false);
        }
        
        function calculateAndLogReadingProgress() {
            // Calculate the reading progress from the leftmost position
            currentScrollPosition = container.scrollLeft;
            const newReadingProgress = Math.round((currentScrollPosition / totalWidth) * 100);
            console.log("currentScrollPosition:", container.scrollLeft);
            console.log("readingProgressDB:", ${item.readingProgress});
            console.log("Local Reading Progress:", newReadingProgress);
            
            function updateReadingProgressOnAndroid(articleId, readingProgressPercent, readingProgressTopPercent, readingAnchorIndex) {
                // Check if the Android interface is available
                if (window.AndroidWebKitMessenger) {
                    // Construct the data object
                    const data = {
                        id: articleId,
                        readingProgressPercent: readingProgressPercent,
                        readingProgressTopPercent: readingProgressTopPercent,
                        readingProgressAnchorIndex: !isNaN(readingAnchorIndex) ? readingAnchorIndex : undefined
                    };
            
                    // Convert the data object to a JSON string
                    const jsonString = JSON.stringify(data);
            
                    // Log the data being sent
                    console.log("Sending reading progress to Android layer:", data);
            
                    // Send the message to the Android layer
                    window.AndroidWebKitMessenger.handleIdentifiableMessage("articleReadingProgress", jsonString);
            
                    // Log the successful sending of the message
                    console.log("Message sent to Android layer successfully.");
                } else {
                    // Log an error if the Android interface is not available
                    console.error("AndroidWebKitMessenger interface is not available.");
                }
                }
        
        updateReadingProgressOnAndroid("${item.savedItemId}", newReadingProgress,0,0); 
        
        }
        
function scrollForward() {
    calculatePagination();
    // Check if the user is already at the rightmost position
    if (container.scrollLeft < totalWidth - averagedScrollingWidth) {
        // Scroll forward
       
        container.scrollLeft += averagedScrollingWidth;
        console.log("scrolling by:", averagedScrollingWidth);
        calculatePagination();

        setToolbar(false);
    } else {
        // Set the toolbar when trying to scroll beyond the rightmost position
        setToolbar(true);
    }
    calculateAndLogReadingProgress();
}

function scrollBack() {
 calculatePagination();
    // Check if the user is already at the leftmost position
    if (container.scrollLeft > 0) {
        // Scroll back
        container.scrollLeft -= averagedScrollingWidth;
        calculatePagination();

        setToolbar(currentPage === 1);
        // Set the toolbar based on the new page position
        
    } else {
        // Set the toolbar when trying to scroll beyond the leftmost position
        setToolbar(true);
    }
    calculateAndLogReadingProgress();
}

function setToolbar(showToolbar) {
  // Show or hide the toolbar based on the boolean input and page position
    if (showToolbar || currentPage === 1) {
        updateToolbarHeightFromJS(100);
    } else {
        updateToolbarHeightFromJS(0);
    }
}



          function updateToolbarHeightFromJS(height) {
    if (typeof ToolbarHeightInterface !== 'undefined') {
        ToolbarHeightInterface.updateToolbarHeight(height);
    }
}     
     
        // Initial call to set up pagination and scroll to the initial page
        document.addEventListener("DOMContentLoaded", function() {
          calculatePagination()
          scrollToInitialPage();
          //calculateAndLogReadingProgress();

          
//todo: get language from the article object
          console.log("slug:", "${item.slug}");
          console.log("Language:", "${item.language}"); 
        });
    
    
    
// Short tap handling
let tapStartTime; 

// Tap handling 
function handleTap(e) {

  // Get tap duration
  const tapDuration = new Date().getTime() - tapStartTime;

  // Only handle short taps
  if(tapDuration > 200) return; 

  // Get tap position
  const tapX = e.changedTouches[0].clientX;
  const tapY = e.changedTouches[0].clientY;


// Check vertical position
if (tapY < document.body.clientHeight * 0.2) {
  // Tap is in the top 10% of the screen
setToolbar(true);
} else {
  // Check horizontal position
  if (tapX < document.body.clientWidth / 2) {
    // Handle left side tap
    scrollBack();
  } else {
    // Handle right side tap
    scrollForward();
  }
}

}

// Add passive tap listener
document.addEventListener('touchend', handleTap, {passive: true});

// Update start time on touch start
document.addEventListener('touchstart', e => {
  tapStartTime = new Date().getTime();
}); 



    
          // Swipe gestures for scrolling
          let touchStartX = null;
          let touchStartY = null;
    
          document.addEventListener(
            "touchstart",
            function (event) {
              touchStartX = event.touches[0].clientX;
              touchStartY = event.touches[0].clientY;
            },
            false
          );
    
          document.addEventListener(
            "touchmove",
            function (event) {
              event.preventDefault();
            },
            { passive: false }
          );
    
          document.addEventListener(
            "touchend",
            function (event) {
              const touchEndX = event.changedTouches[0].clientX;
              const touchEndY = event.changedTouches[0].clientY;
    
              const diffX = touchEndX - touchStartX;
              const diffY = touchEndY - touchStartY;
    
              if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX < -50) {
                  // Swipe left
                  scrollForward();
                } else if (diffX > 50) {
                  // Swipe right
                  scrollBack();
                }
              } else {
                // Vertical swipe
                if (diffY < -50) {
                  scrollForward();
                } else if (diffY > 50) {
                  scrollBack();
                }
              }
            },
            false
          );
              </script>

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
  </body>
</html>
    """
    }
}
