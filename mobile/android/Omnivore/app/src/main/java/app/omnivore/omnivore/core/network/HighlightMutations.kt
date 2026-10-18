package app.omnivore.omnivore.core.network

import android.util.Log
import app.omnivore.omnivore.graphql.generated.CreateHighlightMutation
import app.omnivore.omnivore.graphql.generated.DeleteHighlightMutation
import app.omnivore.omnivore.graphql.generated.MergeHighlightMutation
import app.omnivore.omnivore.graphql.generated.UpdateHighlightMutation
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightErrorCode
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.HighlightType
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.core.database.entities.Highlight
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson

data class CreateHighlightParams(
   val type: HighlightType,
   val shortId: String?,
   val id: String?,
   val quote: String?,
   val patch: String?,
   val articleId: String?,
   val `annotation`: String?,
   val highlightPositionAnchorIndex: Int,
   val highlightPositionPercent: Double
) {
  fun asCreateHighlightInput() = CreateHighlightInput(
    type = Optional.presentIfNotNull(type),
    annotation = Optional.presentIfNotNull(annotation),
    articleId = articleId ?: "",
    id = id ?: "",
    patch = Optional.presentIfNotNull(patch),
    quote = Optional.presentIfNotNull(quote),
    shortId = shortId ?: "",
    highlightPositionAnchorIndex = Optional.presentIfNotNull(highlightPositionAnchorIndex),
    highlightPositionPercent = Optional.presentIfNotNull(highlightPositionPercent)
  )
}

data class UpdateHighlightParams(
  val highlightId: String?,
  val libraryItemId: String?,
  val `annotation`: String?,
  val sharedAt: String?,
) {
  fun asUpdateHighlightInput() = UpdateHighlightInput(
    annotation = Optional.presentIfNotNull(`annotation`),
    highlightId = highlightId ?: "",
    sharedAt = Optional.presentIfNotNull(sharedAt)
  )
}

data class MergeHighlightsParams(
  val shortId: String?,
  val id: String?,
  val quote: String?,
  val patch: String?,
  val articleId: String?,
  val prefix: String?,
  val suffix: String?,
  val overlapHighlightIdList: List<String>?,
  val `annotation`: String?
) {
  fun asMergeHighlightInput() = MergeHighlightInput(
    annotation = Optional.presentIfNotNull(`annotation`),
    prefix = Optional.presentIfNotNull(prefix),
    articleId = articleId ?: "",
    id = id ?: "",
    patch = patch ?: "",
    quote = quote ?: "",
    shortId = shortId ?: "",
    overlapHighlightIdList = overlapHighlightIdList ?: listOf()
  )
}

data class DeleteHighlightParams(
  val highlightId: String,
  val libraryItemId: String
) {
  fun asIdList() = listOf(highlightId)
}

suspend fun Networker.deleteHighlight(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, DeleteHighlightParams::class.java).asIdList()
  return deleteHighlights(input)
}

suspend fun Networker.deleteHighlights(highlightIDs: List<String>): Boolean {
  val statuses: MutableList<Boolean> = mutableListOf()
  try {
    for (highlightID in highlightIDs) {
      val result =
        authenticatedApolloClient().mutation(DeleteHighlightMutation(highlightID)).execute()
      statuses.add(result.data?.deleteHighlight?.onDeleteHighlightSuccess?.highlight != null)
    }
  } catch (e: java.lang.Exception) {
    return false
  }

  val hasFailure = statuses.any { !it }
  return !hasFailure
}

suspend fun Networker.updateWebHighlight(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, UpdateHighlightParams::class.java).asUpdateHighlightInput()
  return updateHighlight(input)
}

suspend fun Networker.updateHighlight(input: UpdateHighlightInput): Boolean {
  return try {
    val result = authenticatedApolloClient().mutation(UpdateHighlightMutation(input)).execute()
    result.data?.updateHighlight?.onUpdateHighlightSuccess?.highlight != null
  } catch (e: java.lang.Exception) {
    false
  }
}

suspend fun Networker.mergeWebHighlights(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, MergeHighlightsParams::class.java).asMergeHighlightInput()
  return mergeHighlights(input)
}

suspend fun Networker.mergeHighlights(input: MergeHighlightInput): Boolean {
  return try {
    val result = authenticatedApolloClient().mutation(MergeHighlightMutation(input)).execute()
    Log.d("Network", "highlight merge result: $result")
    result.data?.mergeHighlight?.onMergeHighlightSuccess?.highlight != null
  } catch (e: java.lang.Exception) {
    false
  }
}

suspend fun Networker.createWebHighlight(jsonString: String): Boolean {
  val input = Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()
  return createHighlight(input) != null
}

data class CreateHighlightResult(
  val failedToCreate: Boolean,
  val alreadyExists: Boolean,
  val newHighlight: Highlight?
)

suspend fun Networker.createHighlight(input: CreateHighlightInput): CreateHighlightResult {
  try {
    val result = authenticatedApolloClient().mutation(CreateHighlightMutation(input)).execute()
    val createdHighlight = result.data?.createHighlight?.onCreateHighlightSuccess?.highlight

    if (createdHighlight != null) {
      return CreateHighlightResult(
        failedToCreate = false,
        alreadyExists = false,
        newHighlight = Highlight(
        type = createdHighlight.highlightFields.type.toString(),
        highlightId = createdHighlight.highlightFields.id,
        shortId = createdHighlight.highlightFields.shortId,
        quote = createdHighlight.highlightFields.quote,
        prefix = createdHighlight.highlightFields.prefix,
        suffix = createdHighlight.highlightFields.suffix,
        patch = createdHighlight.highlightFields.patch,
        annotation = createdHighlight.highlightFields.annotation,
        createdAt =  createdHighlight.highlightFields.createdAt.toString(),
        updatedAt = createdHighlight.highlightFields.updatedAt.toString(),
        createdByMe = createdHighlight.highlightFields.createdByMe,
        color = createdHighlight.highlightFields.color,
        highlightPositionPercent = createdHighlight.highlightFields.highlightPositionPercent,
        highlightPositionAnchorIndex = createdHighlight.highlightFields.highlightPositionAnchorIndex
        )
      )
    } else {
      if (result.data?.createHighlight?.onCreateHighlightError?.errorCodes?.first() == CreateHighlightErrorCode.ALREADY_EXISTS) {
        return CreateHighlightResult(
          failedToCreate = false,
          alreadyExists = true,
          newHighlight = null
        )
      }
    }
  } catch (e: java.lang.Exception) {
    Log.d("sync", "error creating highlight: "  +e)
  }
  return CreateHighlightResult(
    failedToCreate = true,
    alreadyExists = false,
    newHighlight = null
  )
}
