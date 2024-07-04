package app.omnivore.omnivore.feature.reader

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import androidx.core.net.toFile
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.ReadingProgressParams
import app.omnivore.omnivore.core.network.createHighlight
import app.omnivore.omnivore.core.network.deleteHighlights
import app.omnivore.omnivore.core.network.mergeHighlights
import app.omnivore.omnivore.core.network.savedItem
import app.omnivore.omnivore.core.network.updateHighlight
import app.omnivore.omnivore.core.network.updateReadingProgress
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.NanoId
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.network.getUriForInternalFile
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson
import com.pspdfkit.annotations.Annotation
import com.pspdfkit.annotations.HighlightAnnotation
import com.pspdfkit.document.download.DownloadJob
import com.pspdfkit.document.download.DownloadRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.lang.Double.max
import java.lang.Double.min
import java.util.*
import javax.inject.Inject

data class PDFReaderParams(
  val item: SavedItem,
  val articleContent: ArticleContent,
  val localFileUri: Uri
)

@HiltViewModel
class PDFReaderViewModel @Inject constructor(
  private val dataService: DataService,
  private val networker: Networker,
  @ApplicationContext private val applicationContext: Context
): ViewModel() {
  var annotationUnderNoteEdit: Annotation? = null
  val pdfReaderParamsLiveData = MutableLiveData<PDFReaderParams?>(null)
  private var currentReadingProgress = 0.0
  private var currentReadingPageIndex = 0

  fun loadItem(slug: String, context: Context) {
    viewModelScope.launch {
      loadItemFromDB(slug, context)
      loadItemFromNetwork(slug, context)
    }
  }



  private suspend fun loadItemFromDB(slug: String, context: Context) {
    withContext(Dispatchers.IO) {
      val persistedItem = dataService.db.savedItemDao().getSavedItemWithLabelsAndHighlights(slug)
      persistedItem?.let { item ->
          Log.d("PDF", " - persistedItem?.let { item -> ${item}")
          Log.d("PDF", " - item.savedItem.localPDF -> ${item.savedItem.localPDF}")

          val localPdf =  getUriForInternalFile(context,"${item.savedItem.savedItemId}.pdf")
          val localFile = localPdf.toFile()

          if (localFile.exists()) {
            val articleContent = ArticleContent(
              title = item.savedItem.title,
              htmlContent = "",
              highlights = item.highlights,
              contentStatus = "SUCCEEDED",
              labelsJSONString = Gson().toJson(item.labels)
            )

            pdfReaderParamsLiveData.postValue(
              PDFReaderParams(
                item.savedItem,
                articleContent,
                  localPdf
              )
            )
        }
      }
    }
  }

  private suspend fun loadItemFromNetwork(slug: String, context: Context) {
    withContext(Dispatchers.IO) {
      val articleQueryResult = networker.savedItem(context = applicationContext, slug)
      val article = articleQueryResult.item ?: return@withContext
      val request = DownloadRequest.Builder(context)
        .uri(article.pageURLString)
        .build()

      val job = DownloadJob.startDownload(request)
      job.setProgressListener(object : DownloadJob.ProgressListenerAdapter() {
        override fun onComplete(output: File) {
          val articleContent = ArticleContent(
            title = article.title,
            htmlContent = "",
            highlights = articleQueryResult.highlights,
            contentStatus = "SUCCEEDED",
            labelsJSONString = Gson().toJson(articleQueryResult.labels)
          )

          currentReadingProgress = article.readingProgress
          currentReadingPageIndex = article.readingProgressAnchor

          pdfReaderParamsLiveData.postValue(
            PDFReaderParams(
              article,
              articleContent,
              Uri.fromFile(output)
            )
          )
        }

        override fun onError(exception: Throwable) {
//      handleDownloadError(exception)
        }
      })
    }
  }

  fun reset() {
    pdfReaderParamsLiveData.postValue(null)
  }

  fun syncPageChange(currentPageIndex: Int, totalPages: Int) {
    val rawProgress = ((currentPageIndex + 1).toDouble() / totalPages.toDouble()) * 100
    val percent = min(100.0, max(0.0, rawProgress))
    currentReadingProgress = percent
    currentReadingPageIndex = currentPageIndex
    viewModelScope.launch {
      val params = ReadingProgressParams(
        id = pdfReaderParamsLiveData.value?.item?.savedItemId,
        readingProgressPercent = percent,
        readingProgressAnchorIndex = currentPageIndex,
        force = true
      )
      networker.updateReadingProgress(params)
    }
  }

  fun syncHighlightUpdates(newAnnotation: Annotation, quote: String, overlapIds: List<String>, note: String? = null) {
    val itemID = pdfReaderParamsLiveData.value?.item?.savedItemId ?: return
    val highlightID = UUID.randomUUID().toString()
    val shortId = NanoId.generate(size=14)

    val jsonValues = JSONObject()
      .put("id", highlightID)
      .put("shortId", shortId)
      .put("quote", quote)
      .put("articleId", itemID)

    newAnnotation.customData = JSONObject().put("omnivoreHighlight", jsonValues)

    if (overlapIds.isNotEmpty()) {
      val input = MergeHighlightInput(
        annotation = Optional.Absent, // TODO: make sure we preserve note locally
        articleId = itemID,
        id = highlightID,
        overlapHighlightIdList = overlapIds,
        patch = newAnnotation.toInstantJson(),
        quote = quote,
        shortId = shortId
      )

      viewModelScope.launch {
        networker.mergeHighlights(input)
      }
    } else {
      val createHighlightInput = CreateHighlightInput(
        annotation = Optional.presentIfNotNull(note),
        articleId = itemID,
        id = highlightID,
        patch = Optional.presentIfNotNull(newAnnotation.toInstantJson()),
        quote = Optional.presentIfNotNull(quote),
        shortId = shortId,
        highlightPositionAnchorIndex = Optional.presentIfNotNull(currentReadingPageIndex),
        highlightPositionPercent = Optional.presentIfNotNull(currentReadingProgress)
      )

      viewModelScope.launch {
        networker.createHighlight(createHighlightInput)
      }

      if (note != null) {
        storeUpdatedNoteLocally(newAnnotation, note)
      }
    }
  }

  fun updateHighlightNote(annotation: Annotation, note: String) {
    // Save the updated note locally
    storeUpdatedNoteLocally(annotation, note)

    // Sync update with data service
    viewModelScope.launch {
      val input = UpdateHighlightInput(
        annotation = Optional.presentIfNotNull(note),
        highlightId = pluckHighlightID(annotation) ?: "",
        sharedAt = Optional.Absent
      )
      networker.updateHighlight(input)
      Log.d("network", "updated $annotation")
    }
  }

  private fun storeUpdatedNoteLocally(annotation: Annotation, note: String) {
    val omnivoreHighlight = annotation.customData?.get("omnivoreHighlight") as? JSONObject
    omnivoreHighlight?.put("editedNote", note)
    omnivoreHighlight?.let {
      Log.d("pdf", "setting custom data: $omnivoreHighlight")
      annotation.customData = JSONObject().put("omnivoreHighlight", it)
    }
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

  fun pluckHighlightID(annotation: Annotation): String? {
    val omnivoreHighlight = annotation.customData?.get("omnivoreHighlight") as? JSONObject
    return omnivoreHighlight?.get("id") as? String
  }

  fun pluckExistingNote(annotation: Annotation): String? {
    val omnivoreHighlight = annotation.customData?.opt("omnivoreHighlight") as? JSONObject ?: return null

    val editedNote = omnivoreHighlight.opt("editedNote") as? String
    if (editedNote != null) { return editedNote }

    val shortID = omnivoreHighlight.get("shortId") as? String ?: return null

    pdfReaderParamsLiveData.value?.articleContent?.highlights?.let {
      val matchingHighlight = it.firstOrNull { highlight -> highlight.shortId == shortID }
      return matchingHighlight?.annotation
    }

    return null
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
}
