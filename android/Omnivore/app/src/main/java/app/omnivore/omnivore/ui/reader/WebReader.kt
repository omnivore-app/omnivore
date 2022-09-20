package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import app.omnivore.omnivore.models.LinkedItem

@Composable
fun WebReaderLoadingContainer(slug: String, webReaderViewModel: WebReaderViewModel) {
  // TODO: create a viewmodel where we can fetch item and articleContent
  val item = LinkedItem(
    id = "1",
    title = "test title",
    createdAt = "",
    readAt = "",
    readingProgress = 0.0,
    readingProgressAnchor = 0,
    imageURLString = "",
    pageURLString = "https://omnivore.app",
    descriptionText = "mock item",
    publisherURLString = "",
    author = "someone",
    slug = "sluggo",
    publishDate = ""
  )

  val content = """
    <DIV id="readability-content"><DIV class="page" id="readability-page-1"><div data-omnivore-anchor-idx="1"><phoenix-intersection-notifier data-omnivore-anchor-idx="2" in-view="phoenix:header:in" out-of-view="phoenix:header:out" threshold="0.1"><header data-omnivore-anchor-idx="3" phx-track-id="header" id="flex-nav"></header></phoenix-intersection-notifier><div data-omnivore-anchor-idx="4" ng-class="pageClasses" id="main-content"><section data-omnivore-anchor-idx="5"><article data-omnivore-anchor-idx="6"><div data-omnivore-anchor-idx="7"><header data-omnivore-anchor-idx="8"></header><div data-omnivore-anchor-idx="9"><!-- tml-version="2" --><div data-omnivore-anchor-idx="10"><figure data-omnivore-anchor-idx="11" itemscope itemtype="http://schema.org/ImageObject"><phoenix-picture data-omnivore-anchor-idx="12"><a data-omnivore-anchor-idx="13"><picture data-omnivore-anchor-idx="14"><source data-omnivore-anchor-idx="15" type="image/webp" sizes="(min-width: 1240px) 700px, (min-width: 675px) 620px, calc(100vw - 40px)" srcset="https://proxy-demo.omnivore-image-cache.app/380x0,so8ItOCq36W69dOPxDe0H4WEUyGQCYaQpPD8U3AShSdg/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_380/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.webp 380w,https://proxy-demo.omnivore-image-cache.app/620x0,siNuC6V9OY3P1NRHbK3yrd1B77IgaoGi_182YIS3F814/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_620/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.webp 620w,https://proxy-demo.omnivore-image-cache.app/1240x0,sji5QuAlez8G5akRq9cffGLh93rUslhD019pewYsHDns/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_1240/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.webp 1240w,https://proxy-demo.omnivore-image-cache.app/700x0,sam4q001CF111r5iM8bQLu8KoUwtvbhAAbaych8_kz1o/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_700/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.webp 700w,https://proxy-demo.omnivore-image-cache.app/1400x0,sArPZnAopk1sMjlJkS7VrX0OJiovKDB305t8_VRIpT9Q/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_1400/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.webp 1400w,"><source data-omnivore-anchor-idx="16" sizes="(min-width: 1240px) 700px, (min-width: 675px) 620px, calc(100vw - 40px)" srcset="https://proxy-demo.omnivore-image-cache.app/380x0,splq_8Dc58ZTmjwp562ZqfJfFSXbxmv04iEhga125Vt0/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_380/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg 380w,https://proxy-demo.omnivore-image-cache.app/620x0,sIzPkwbhx1FdFvrujIlxW4SVaJEvgZc2UOAlDVwYLVeQ/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_620/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg 620w,https://proxy-demo.omnivore-image-cache.app/1240x0,sCQwWZMaJf_EHz9_xzotuk4-xz9iFjoJQ4gRRsU1Zcjg/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1240/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg 1240w,https://proxy-demo.omnivore-image-cache.app/700x0,sXtdZJezcS29VTdwtsJOmHpUFaDrdzbYkfJh8hehLDGk/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_700/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg 700w,https://proxy-demo.omnivore-image-cache.app/1400x0,sUXQkX3XRso6CQbZNarURSzqC6WM_VgrbgB1DCYjW9eo/https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1400/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg 1400w,"><img data-omnivore-anchor-idx="17" alt="Cowboys quarterback Dak Prescott" decoding="async" src="https://proxy-demo.omnivore-image-cache.app/2048x1365,s-6DkK8w6FrV8T8MPn5iDDsHiYEsbkx4gL8O8K2l4b6M/https://thespun.com/.image/t_share/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg" data-src="https://thespun.com/.image/c_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_700/MTg3NDI1NTczMzMzOTAzMTE5/arizona-cardinals-v-dallas-cowboys.jpg" height="1365" width="2048" itemprop="contentUrl url"></picture></a></phoenix-picture><!-- disableImageMeta is needed to prevent duplicate rendering of the image meta.--><!-- Duplicate rendering can occur because we have moved the image metadata outside of--><!-- the .m-detail-header--container. The original image metadata in tmlImage is needed--><!-- for the InContent detail header which renders when the media size is inline or breakout.--><figcaption data-omnivore-anchor-idx="18"><p data-omnivore-anchor-idx="19" itemprop="caption">ARLINGTON, TEXAS - JANUARY 02: Dak Prescott #4 of the Dallas Cowboys reacts after completing a pass against the Arizona Cardinals in the fourth quarter at AT&amp;T Stadium on January 02, 2022 in Arlington, Texas. (Photo by Tom Pennington/Getty Images)</p></figcaption></figure></div><p data-omnivore-anchor-idx="20">Dak Prescott will not take the field for the Cowboys' preseason finale against the Seahawks on Friday, per Dallas beat writer Clarence Hill Jr.</p><p data-omnivore-anchor-idx="21">The Cowboys' starting quarterback has not notched any in-game action this preseason despite being fully healthy.</p><div data-omnivore-anchor-idx="22" data-tweet-id="1562199982156853249" class="tweet-placeholder"></div><p data-omnivore-anchor-idx="23">Prescott didn't play in the preseason last year as he continued to recover from a devastating leg injury he suffered during the 2020 season. This year, his absence from preseason action likely stems from his veteran status and a desire to keep him healthy ahead of the 2022 campaign.</p><p data-omnivore-anchor-idx="24">While Prescott hasn't notched any in-game action this preseason, he has impressed during training camp practices. Cowboys vice president Stephen Jones says this year is the "best camp" he's ever seen out of the former fourth-round draft pick.</p><p data-omnivore-anchor-idx="25">After not suiting up for any preseason action in 2021, Prescott took the field and delivered a 403-yard, three-touchdown performance against the Tampa Bay Buccaneers in Week 1.&nbsp;</p><p data-omnivore-anchor-idx="26">This year, Dak and the Cowboys will open up their 2022 season with another Week 1 matchup against the Bucs.</p><p data-omnivore-anchor-idx="27">Backups Cooper Rush and Ben DiNucci have taken the majority of in-game preseason snaps this year. Injured backup Will Grier returned to practice in a limited capacity this evening.</p></div></div></article></section><section data-omnivore-anchor-idx="28"><phoenix-outbrain data-omnivore-anchor-idx="29" block-premium="" block-on-gdpr-vendor-consent="outbrain" block-on-gdpr-purpose-consent="content" block-on-ccpa-reject=""></phoenix-outbrain></section></div></div></DIV></DIV>
  """

  val articleContent = ArticleContent(
    title = "test title",
    htmlContent = content,
    highlightsJSONString = "[]",
    contentStatus = "SUCCEEDED",
    objectID = ""
  )

  WebReader(item = item, articleContent = articleContent)
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(item: LinkedItem, articleContent: ArticleContent) {
  WebView.setWebContentsDebuggingEnabled(true)

  val webReaderContent = WebReaderContent(
    textFontSize = 12,
    lineHeight =  150,
    maxWidthPercentage = 100,
    item = item,
    themeKey = "LightGray",
    fontFamily = WebFont.SYSTEM ,
    articleContent = articleContent,
    prefersHighContrastText = false,
  )

  val styledContent = webReaderContent.styledContent()

  AndroidView(factory = {
    WebView(it).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )

      settings.javaScriptEnabled = true
      settings.allowContentAccess = true
      settings.allowFileAccess = true
      settings.domStorageEnabled = true

      webViewClient = object : WebViewClient() {
      }

      loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);

    }
  }, update = {
    it.loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);
  })
}
