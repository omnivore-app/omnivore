package app.omnivore.omnivore.models

import android.graphics.Color
import android.graphics.Rect
import android.graphics.RectF
import app.omnivore.omnivore.networking.CreateHighlightParams
import com.google.gson.Gson
import com.pspdfkit.annotations.AnnotationType
import com.pspdfkit.annotations.BlendMode
import com.pspdfkit.annotations.HighlightAnnotation

data class Highlight(
  val id: String,
  val shortId: String,
  val quote: String,
  val prefix: String?,
  val suffix: String?,
  val patch: String,
  val annotation: String?,
  val createdAt: Any?,
  val updatedAt: Any?,
  val createdByMe : Boolean,
) {
  fun asHighlightAnnotation(): HighlightAnnotation {
    val highlightPatch = Gson().fromJson(patch, HighlightPatch::class.java)

    var highlightAnnotation = HighlightAnnotation(
      highlightPatch.pageIndex,
      highlightPatch.rectList()
    )

    highlightAnnotation.color = Color.parseColor(highlightPatch.color)
    highlightAnnotation.boundingBox = highlightPatch.boundingBox()
    highlightAnnotation.blendMode = BlendMode.MULTIPLY

    return highlightAnnotation

  }
}

data class HighlightPatch(
  val bbox: List<Float>,
  val blendMode: String,
  val color: String,
  val rects: List<List<Float>>,
  val pageIndex: Int
) {
  fun rectList(): List<RectF> {
    return rects.map {
      RectF(it[0], it[1], it[2], it[3])
    }
  }

  fun boundingBox(): RectF {
    return RectF(bbox[0], bbox[1], bbox[2], bbox[3])
  }
}

