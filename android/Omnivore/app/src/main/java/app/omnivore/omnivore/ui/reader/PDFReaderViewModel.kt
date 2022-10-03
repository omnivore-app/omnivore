package app.omnivore.omnivore.ui.reader

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.models.Highlight
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.linkedItem
import com.google.gson.Gson
import com.pspdfkit.annotations.Annotation
import com.pspdfkit.document.download.DownloadJob
import com.pspdfkit.document.download.DownloadRequest
import com.pspdfkit.document.download.Progress
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.io.File
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

      Log.d("anno", "highlights: ${articleQueryResult.highlights}")

      job.setProgressListener(object : DownloadJob.ProgressListenerAdapter() {
        override fun onProgress(progress: Progress) {
//          progressBar.setProgress((100f * progress.bytesReceived / progress.totalBytes).toInt())
        }

        override fun onComplete(output: File) {
          val articleContent = ArticleContent(
            title = article.title,
            htmlContent = article.content ?: "",
            highlightsJSONString = Gson().toJson(articleQueryResult.highlights),
            contentStatus = "SUCCEEDED",
            objectID = "",
            labelsJSONString = Gson().toJson(articleQueryResult.labels)
          )

          pdfReaderParamsLiveData.value = PDFReaderParams(article, articleContent, Uri.fromFile(output))
        }

        override fun onError(exception: Throwable) {
//          handleDownloadError(exception)
        }
      })
    }
  }

  fun reset() {
    pdfReaderParamsLiveData.value = null
  }

//  fun makePDFAnnotations(highlights: List<Highlight>): List<Annotation> {
//    for (highlight in highlights) {
//      Annotation()
//    }
//  }

//  private func applyHighlights(documentProvider: PDFDocumentProvider) {
//    viewModel.loadHighlightPatches { [weak self] highlightPatches in
//      var annnotations: [Annotation] = []
//      for patch in highlightPatches {
//        guard let data = patch.data(using: String.Encoding.utf8) else { continue }
//        let annotation = try? Annotation(fromInstantJSON: data, documentProvider: documentProvider)
//        guard let annotation = annotation else { continue }
//        annnotations.append(annotation)
//      }
//      self?.add(annotations: annnotations)
//
//      self?.highlightsApplied = true
//    }
//  }
}


//2022-10-03 08:39:47.903 22564-22564/app.omnivore.omnivore D/anno: highlights:
//[

//Highlight(
//  id=877d4e93-a525-4749-83c1-f49b7045ed32,
//  shortId=B30zlzGW,
//  quote= especially children, men, and strangers, before he is twelve weeks old. Well-socialized puppies grow up to be wonderful companions, whereas antisocial dogs are difficult, time-consuming, and potentially dangerous. Your puppy needs to learn to enjoy the company of all people and to enjoy being handled by all people, especially children and strangers. As a rule of thumb, your puppy needs to meet at least a hundred people before he is three months old. Since your puppy is still too young to venture out on the,
//  prefix=null,
//  suffix=null,
//  patch={
//    "bbox": [47.035999298095703, 361.49798583984375, 303.94073486328125, 145.78799438476562],
//    "blendMode": "multiply",
//    "color": "#FEE832",
//    "createdAt": "2022-09-30T03:33:47Z",
//    "creatorName": "satindar",
//    "customData": {
//      "omnivoreHighlight": {
//        "articleId": "c2e87313-59ca-48d2-b008-166c16afee63",
//        "id": "877d4e93-a525-4749-83c1-f49b7045ed32",
//        "quote": " especially children, men, and strangers, before he is twelve weeks old. Well-socialized puppies grow up to be wonderful companions, whereas antisocial dogs are difficult, time-consuming, and potentially dangerous. Your puppy needs to learn to enjoy the company of all people and to enjoy being handled by all people, especially children and strangers. As a rule of thumb, your puppy needs to meet at least a hundred people before he is three months old. Since your puppy is still too young to venture out on the",
//        "shortId": "B30zlzGW"
//      }
//    },
//  "name": "FF1F83A7-8D38-4AAA-A882-07A0DD4BAC86",
//  "opacity": 1,
//  "pageIndex": 5,
//  "rects": [[139.03999328613281, 361.49798583984375, 211.30220031738281, 10.788009643554688], [350.34219360351562, 369.70599365234375, 0, 0], [350.34219360351562, 369.70599365234375, 0, 0], [47.035999298095703, 376.49798583984375, 303.61203002929688, 10.788009643554688], [350.64801025390625, 384.70599365234375, 0, 0], [350.64801025390625, 384.70599365234375, 0, 0], [47.155998229980469, 391.49798583984375, 303.5977783203125, 10.788009643554688], [350.75375366210938, 399.70599365234375, 0, 0], [350.75375366210938, 399.70599365234375, 0, 0], [47.324001312255859, 406.49798583984375, 303.64541625976562, 10.788009643554688], [350.96942138671875, 414.70599365234375, 0, 0], [350.96942138671875, 414.70599365234375, 0, 0], [47.057407379150391, 421.49798583984375, 303.53900146484375, 10.787994384765625], [350.59637451171875, 429.70599365234375, 0, 0], [350.59637451171875, 429.70599365234375, 0, 0], [47.297409057617188, 436.49798583984375, 303.57977294921875, 10.787994384765625], [350.87716674804688, 444.70599365234375, 0, 0], [350.87716674804688, 444.70599365234375, 0, 0], [47.609405517578125, 451.49798583984375, 44.86920166015625, 10.787994384765625], [92.478607177734375, 459.70599365234375, 0, 0], [92.478607177734375, 459.70599365234375, 0, 0], [61.577407836914062, 466.49798583984375, 289.39935302734375, 10.787994384765625], [350.97674560546875, 474.70599365234375, 0, 0], [350.97674560546875, 474.70599365234375, 0, 0], [47.10540771484375, 481.49798583984375, 303.55093383789062, 10.787994384765625], [350.65634155273438, 489.70599365234375, 0, 0], [350.65634155273438, 489.70599365234375, 0, 0], [47.189407348632812, 496.49798583984375, 193.45796203613281, 10.787994384765625]], "type": "pspdfkit/markup/highlight", "updatedAt": "2022-09-30T03:33:47Z", "v": 1},
//  annotation=null,
//  createdAt=null,
//  updatedAt=2022-09-30T03:33:48.152Z,
//  createdByMe=true),
//

//
//Highlight(id=4c720330-4ea3-41d4-9b7b-031c9b495312, shortId=dYGMMMbz, quote= So, you have your new puppy. Now what? Basically, you are at a fork in the road. The success of the relationship depends on your teaching your puppy the rules and regulations of domestic living. The most critical time in your dog's life is right now—puppyhood! First impressions are indelible and long-lasting. Consequently, prefix=null, suffix=null, patch={"bbox": [46.13800048828125, 194.449951171875, 303.64797973632812, 85.78802490234375], "blendMode": "multiply", "color": "#FEE832", "createdAt": "2022-10-03T15:35:50
