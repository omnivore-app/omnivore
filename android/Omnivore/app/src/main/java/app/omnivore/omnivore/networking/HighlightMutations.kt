package app.omnivore.omnivore.networking

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

suspend fun Networker.createHighlight(jsonString: String) {
  val input = Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()

  authenticatedApolloClient().mutation(
    CreateHighlightMutation(input)
  ).execute()
}
