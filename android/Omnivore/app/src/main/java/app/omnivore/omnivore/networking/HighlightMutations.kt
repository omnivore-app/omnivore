package app.omnivore.omnivore.networking

import android.util.Log
import app.omnivore.omnivore.graphql.generated.CreateHighlightMutation
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson

data class CreateHighlightParams(
   val shortId: String?,
   val highlightID: String?,
   val quote: String?,
   val patch: String?,
   val articleId: String?,
   val `annotation`: String?
) {
  fun asCreateHighlightInput() = CreateHighlightInput(
    annotation = Optional.presentIfNotNull(`annotation`),
    articleId = articleId ?: "",
    id = highlightID ?: "",
    patch = patch ?: "",
    quote = quote ?: "",
    shortId = shortId ?: ""
  )
}

suspend fun Networker.createHighlight(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()

  Log.d("Loggo", "created highlight input: $input")

  val result = authenticatedApolloClient().mutation(CreateHighlightMutation(input)).execute()

  val highlight = result.data?.createHighlight?.onCreateHighlightSuccess?.highlight
  return highlight != null
}
