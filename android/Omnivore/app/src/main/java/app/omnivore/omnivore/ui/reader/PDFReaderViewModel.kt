package app.omnivore.omnivore.ui.reader

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.linkedItem
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PDFReaderParams(
  val item: LinkedItem,
  val articleContent: ArticleContent
)

@HiltViewModel
class PDFReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val networker: Networker
): ViewModel() {
  val pdfReaderParamsLiveData = MutableLiveData<PDFReaderParams?>(null)

  fun loadItem(slug: String) {
    viewModelScope.launch {
      val articleQueryResult = networker.linkedItem(slug)

      val article = articleQueryResult.item ?: return@launch

      val articleContent = ArticleContent(
        title = article.title,
        htmlContent = article.content ?: "",
        highlightsJSONString = Gson().toJson(articleQueryResult.highlights),
        contentStatus = "SUCCEEDED",
        objectID = "",
        labelsJSONString = Gson().toJson(articleQueryResult.labels)
      )

      pdfReaderParamsLiveData.value = PDFReaderParams(article, articleContent)
    }
  }

  fun reset() {
    pdfReaderParamsLiveData.value = null
  }
}
