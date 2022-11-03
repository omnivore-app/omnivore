package app.omnivore.omnivore.ui.reader

import android.content.Context
import android.graphics.RectF
import android.net.Uri
import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.models.Highlight
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.*
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson
import com.pspdfkit.annotations.Annotation
import com.pspdfkit.document.download.DownloadJob
import com.pspdfkit.document.download.DownloadRequest
import com.pspdfkit.document.download.Progress
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.io.File
import java.util.*
import javax.inject.Inject

data class PDFReaderParams(
  val item: LinkedItem,
  val articleContent: ArticleContent,
  val localFileUri: Uri
)

@HiltViewModel
class PDFReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val networker: Networker
): ViewModel() {
  val pdfReaderParamsLiveData = MutableLiveData<PDFReaderParams?>(null)
  var annotations: List<Annotation> = listOf()

  fun loadItem(slug: String, context: Context) {
    viewModelScope.launch {
      val articleQueryResult = networker.linkedItem(slug)

      val article = articleQueryResult.item ?: return@launch

      val request = DownloadRequest.Builder(context)
        .uri(article.pageURLString)
        .build()

      val job = DownloadJob.startDownload(request)

      job.setProgressListener(object : DownloadJob.ProgressListenerAdapter() {
        override fun onProgress(progress: Progress) {
//          progressBar.setProgress((100f * progress.bytesReceived / progress.totalBytes).toInt())
        }

        override fun onComplete(output: File) {
          val articleContent = ArticleContent(
            title = article.title,
            htmlContent = article.content ?: "",
            highlights = articleQueryResult.highlights,
            contentStatus = "SUCCEEDED",
            objectID = "",
            labelsJSONString = Gson().toJson(articleQueryResult.labels)
          )

          pdfReaderParamsLiveData.postValue(PDFReaderParams(article, articleContent, Uri.fromFile(output)))
        }

        override fun onError(exception: Throwable) {
//          handleDownloadError(exception)
        }
      })
    }
  }

  fun reset() {
    pdfReaderParamsLiveData.postValue(null)
  }

  fun createHighlight(annotation: Annotation, articleID: String) {
    // TODO: Check for overlapping highlights
    val createHighlightInput = CreateHighlightInput(
      annotation = Optional.presentIfNotNull(null),
      articleId = articleID,
      id = UUID.randomUUID().toString(),
      patch = annotation.toInstantJson(),
      quote = annotation.contents ?: "",
      shortId = UUID.randomUUID().toString().replace("-","").substring(0,8),
    )

//    val ggg = overlappingHighlights(annotation)
//    Log.d("annny", "has ${ggg.count()} overlapping highlights")

    viewModelScope.launch {
      val isHighlightSynced = networker.createHighlight(createHighlightInput)
      Log.d("Network", "isHighlightSynced = $isHighlightSynced")
    }
  }

  fun updateHighlight(annotation: Annotation) {
    Log.d("annny", "updated $annotation")
  }

  fun deleteHighlight(annotation: Annotation) {
    Log.d("annny", "deleted $annotation")
  }

  private fun overlappingHighlights(annotation: Annotation): List<Highlight> {
    var result: MutableList<Highlight> = mutableListOf()

    for (highlight in pdfReaderParamsLiveData.value?.articleContent?.highlights ?: listOf()) {
      if (hasOverlappingHighlights(highlight, annotation)) {
        result.add(highlight)
      }
    }

    return result
  }

  private fun hasOverlappingHighlights(highlight: Highlight, annotation: Annotation): Boolean {
    val highlightRects = Gson().fromJson(highlight.patch, HighlightRects::class.java).rects

    for (rect in highlightRects) {
      if (rect.intersect(annotation.boundingBox)) {
        return true
      }
    }
    return false
  }
}

data class HighlightRects(
  val rects: List<RectF>
)
