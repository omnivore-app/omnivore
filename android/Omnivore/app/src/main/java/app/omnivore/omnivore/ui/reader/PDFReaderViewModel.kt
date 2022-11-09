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
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
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

  fun syncHighlightUpdates(newAnnotation: Annotation, overlapIds: List<String>) {
    val itemID = pdfReaderParamsLiveData.value?.item?.id ?: return
    val highlightID = UUID.randomUUID().toString()
    val shortID = UUID.randomUUID().toString().replace("-","").substring(0,8)
    val quote = newAnnotation.contents ?: ""

    newAnnotation.customData = createCustomData(highlightID, shortID, quote, itemID)

    if (overlapIds.isNotEmpty()) {
      val input = MergeHighlightInput(
        annotation = Optional.presentIfNotNull(newAnnotation.contents),
        articleId = itemID,
        id = highlightID,
        overlapHighlightIdList = overlapIds,
        patch = newAnnotation.toInstantJson(),
        quote = quote,
        shortId = shortID
      )

      viewModelScope.launch {
        networker.mergeHighlights(input)
      }
    } else {
      val createHighlightInput = CreateHighlightInput(
        annotation = Optional.presentIfNotNull(null),
        articleId = itemID,
        id = highlightID,
        patch = newAnnotation.toInstantJson(),
        quote = quote,
        shortId = shortID,
      )

      viewModelScope.launch {
        networker.createHighlight(createHighlightInput)
      }
    }
  }

  private fun createCustomData(
    highlightID: String,
    shortID: String,
    quote: String,
    articleID: String
  ): JSONObject {
    val jsonValues = JSONObject()
      .put("id", highlightID)
      .put("shortId", shortID)
      .put("quote", quote)
      .put("articleId", articleID)

    return JSONObject()
      .put("omnivoreHighlight", jsonValues)
  }

  fun deleteHighlight(annotation: Annotation) {
    val highlightID = pluckHighlightID(annotation) ?: return
    viewModelScope.launch {
      networker.deleteHighlights(listOf(highlightID))
      Log.d("network", "deleted $annotation")
    }
  }

  fun overlappingAnnotations(newAnnotation: Annotation, existingAnnotations: List<Annotation>): List<Annotation> {
    val result: MutableList<Annotation> = mutableListOf()

    for (existingAnnotation in existingAnnotations) {
      if (hasOverlaps(newAnnotation, existingAnnotation)) {
        result.add(existingAnnotation)
      }
    }

    return result
  }

  private fun hasOverlaps(leftAnnotation: Annotation, rightAnnotation: Annotation): Boolean {
    for (leftRect in (leftAnnotation as? HighlightAnnotation)?.rects ?: listOf()) {
      for (rightRect in (rightAnnotation as? HighlightAnnotation)?.rects ?: listOf()) {
        if (rightRect.intersect(leftRect)) {
          return true
        }
      }
    }

    return false
  }

  fun pluckHighlightID(annotation: Annotation): String? {
    val omnivoreHighlight = annotation.customData?.get("omnivoreHighlight") as? JSONObject
    return omnivoreHighlight?.get("id") as? String
  }
}
