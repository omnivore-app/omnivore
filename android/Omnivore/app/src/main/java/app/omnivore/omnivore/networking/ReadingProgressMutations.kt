package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SaveArticleReadingProgressMutation
import app.omnivore.omnivore.graphql.generated.type.SaveArticleReadingProgressInput


import android.util.Log
import com.google.gson.Gson

data class ReadingProgressParams(
  val id: String?,
  val readingProgressPercent: Double?,
  val readingProgressAnchorIndex: Int?
) {
  fun asSaveReadingProgressInput() = SaveArticleReadingProgressInput(
    id = id ?: "",
    readingProgressPercent = readingProgressPercent ?: 0.0,
    readingProgressAnchorIndex = readingProgressAnchorIndex ?: 0
  )
}

suspend fun Networker.updateWebReadingProgress(jsonString: String): Boolean {
  val params = Gson().fromJson(jsonString, ReadingProgressParams::class.java)
  return updateReadingProgress(params)
}

suspend fun Networker.updateReadingProgress(params: ReadingProgressParams): Boolean {
  val input = params.asSaveReadingProgressInput()

  Log.d("Loggo", "created reading progress input: $input")

  val result = authenticatedApolloClient()
    .mutation(SaveArticleReadingProgressMutation(input))
    .execute()

  val articleID = result.data?.saveArticleReadingProgress?.onSaveArticleReadingProgressSuccess?.updatedArticle?.id

  Log.d("Loggo", "updated article with id: $articleID")

  return articleID != null
}
