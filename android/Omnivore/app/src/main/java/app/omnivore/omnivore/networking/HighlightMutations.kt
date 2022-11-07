package app.omnivore.omnivore.networking

import android.util.Log
import app.omnivore.omnivore.graphql.generated.CreateHighlightMutation
import app.omnivore.omnivore.graphql.generated.DeleteHighlightMutation
import app.omnivore.omnivore.graphql.generated.MergeHighlightMutation
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
import app.omnivore.omnivore.models.Highlight
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson
import com.pspdfkit.annotations.HighlightAnnotation

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

suspend fun Networker.deleteHighlights(highlightIDs: List<String>): Boolean {
  val statuses: MutableList<Boolean> = mutableListOf()
  for (highlightID in highlightIDs) {
    val result = authenticatedApolloClient().mutation(DeleteHighlightMutation(highlightID)).execute()
    statuses.add(result.data?.deleteHighlight?.onDeleteHighlightSuccess?.highlight != null)
  }

  val hasFailure = statuses.any { !it }
  return !hasFailure
}

suspend fun Networker.mergeHighlights(input: MergeHighlightInput): Boolean {
  val result = authenticatedApolloClient().mutation(MergeHighlightMutation(input)).execute()
  Log.d("Network", "highlight merge result: $result")
  return result.data?.mergeHighlight?.onMergeHighlightSuccess?.highlight != null
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
