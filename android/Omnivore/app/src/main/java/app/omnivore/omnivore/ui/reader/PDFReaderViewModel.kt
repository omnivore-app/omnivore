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
import com.pspdfkit.annotations.HighlightAnnotation
import com.pspdfkit.document.download.DownloadJob
import com.pspdfkit.document.download.DownloadRequest
import com.pspdfkit.document.download.Progress
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.merge
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
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
  var annotations: List<HighlightAnnotation> = listOf()
  var documentHighlights: MutableList<Highlight> = mutableListOf()

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
          documentHighlights.addAll(0, articleQueryResult.highlights)

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

  fun createHighlight(annotation: Annotation, articleID: String, updateDoc: Boolean = true) {
    val highlightID = UUID.randomUUID().toString()
    val shortID = UUID.randomUUID().toString().replace("-","").substring(0,8)
    val quote = annotation.contents ?: ""

    val jsonValues = JSONObject()
      .put("id", highlightID)
      .put("shortId", shortID)
      .put("quote", quote)
      .put("articleId", articleID)

    val omnivoreHighlight = JSONObject()
      .put("omnivoreHighlight", jsonValues)

    annotation.customData = omnivoreHighlight

    val createHighlightInput = CreateHighlightInput(
      annotation = Optional.presentIfNotNull(null),
      articleId = articleID,
      id = highlightID,
      patch = annotation.toInstantJson(),
      quote = quote,
      shortId = shortID,
    )

    viewModelScope.launch {
      val highlight = networker.createHighlight(createHighlightInput)
      if (highlight != null) {
        documentHighlights.add(highlight)
      }
    }
  }

  fun syncUpdatedAnnotationHighlight(annotation: HighlightAnnotation, articleID: String) {
    val overlapList = overlappingHighlightIDs(annotation)
    // TODO: Delete the overlap list
    // Calling create highlight creates a loop...
//    createHighlight(annotation, articleID)
  }

  fun deleteHighlight(annotation: Annotation) {
    Log.d("annny", "deleted $annotation")
  }

  private fun overlappingHighlightIDs(annotation: HighlightAnnotation): List<String> {
    val result: MutableList<String> = mutableListOf()
    val highlightID = pluckHighlightID(annotation) ?: return listOf()

    val pageHighlights = documentHighlights.filter {
      Gson().fromJson(it.patch, HighlightPatch::class.java).pageIndex == annotation.pageIndex
    }

    for (highlight in pageHighlights) {
      if (highlight.id == highlightID) {
        continue
      }

      val rects = Gson().fromJson(highlight.patch, HighlightPatch::class.java).rects
      if (hasOverlaps(annotation.rects, rects)) {
        result.add(highlight.id)
      }
    }

    result.add(highlightID)

    return result
  }

  private fun hasOverlaps(leftRects: List<RectF>, rightRects: List<List<Double>>): Boolean {
    for (leftRect in leftRects) {
      for (rightRect in rightRects) {
        val transformedRect = RectF(rightRect[0].toFloat(), rightRect[1].toFloat(), rightRect[2].toFloat(), rightRect[3].toFloat())
        if (transformedRect.intersect(leftRect)) {
          return true
        }
      }
    }

    return false
  }

  private fun pluckHighlightID(annotation: Annotation): String? {
    val omnivoreHighlight = annotation.customData?.get("omnivoreHighlight") as? JSONObject
    return omnivoreHighlight?.get("id") as? String
  }
}

data class HighlightPatch(
  val rects: List<List<Double>>,
  val pageIndex: Int
)
