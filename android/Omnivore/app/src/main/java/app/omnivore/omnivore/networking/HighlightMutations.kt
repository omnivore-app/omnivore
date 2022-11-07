package app.omnivore.omnivore.networking

import android.util.Log
import app.omnivore.omnivore.graphql.generated.CreateHighlightMutation
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.models.Highlight
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

suspend fun Networker.createWebHighlight(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()
  return createHighlight(input) != null
}

suspend fun Networker.createHighlight(input: CreateHighlightInput): Highlight? {
  Log.d("Loggo", "created highlight input: $input")

  val result = authenticatedApolloClient().mutation(CreateHighlightMutation(input)).execute()

  val createdHighlight = result.data?.createHighlight?.onCreateHighlightSuccess?.highlight

  if (createdHighlight != null) {
    return Highlight(
      id = createdHighlight.highlightFields.id,
      shortId = createdHighlight.highlightFields.shortId,
      quote = createdHighlight.highlightFields.quote,
      prefix = createdHighlight.highlightFields.prefix,
      suffix = createdHighlight.highlightFields.suffix,
      patch = createdHighlight.highlightFields.patch,
      annotation = createdHighlight.highlightFields.annotation,
      createdAt = null, // TODO: update gql query to get this
      updatedAt = createdHighlight.highlightFields.updatedAt,
      createdByMe = createdHighlight.highlightFields.createdByMe,
    )
  } else {
    return null
  }
}
