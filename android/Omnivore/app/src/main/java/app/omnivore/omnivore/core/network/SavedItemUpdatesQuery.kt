package app.omnivore.omnivore.core.network

import app.omnivore.omnivore.graphql.generated.UpdatesSinceQuery
import app.omnivore.omnivore.graphql.generated.type.UpdateReason
import com.apollographql.apollo3.api.Optional

data class SavedItemUpdatesQueryResponse(
  val cursor: String?,
  val hasMoreItems: Boolean,
  val deletedItemIDs: List<String>,
  val items: List<UpdatesSinceQuery.Node>
)

suspend fun Networker.savedItemUpdates(
  cursor: String? = null,
  limit: Int = 15,
  since: String
): SavedItemUpdatesQueryResponse? {
  try {
    val result = authenticatedApolloClient().query(
      UpdatesSinceQuery(
        folder = Optional.presentIfNotNull("all"),
        after = Optional.presentIfNotNull(cursor),
        first = Optional.presentIfNotNull(limit),
        since = since
      )
    ).execute()

    val payload = result.data?.updatesSince?.onUpdatesSinceSuccess ?: return null
    val itemNodes: MutableList<UpdatesSinceQuery.Node> = mutableListOf()
    val deletedItemIDs: MutableList<String> = mutableListOf()

    for (edge in payload.edges) {
      if (edge.updateReason == UpdateReason.DELETED) {
        deletedItemIDs.add(edge.itemID)
      } else if (edge.node != null) {
        itemNodes.add(edge.node)
      }
    }

    return SavedItemUpdatesQueryResponse(
      cursor = payload.pageInfo.endCursor,
      hasMoreItems = payload.pageInfo.hasNextPage,
      deletedItemIDs = deletedItemIDs,
      items = itemNodes
    )
  } catch (e: java.lang.Exception) {
    return null
  }
}
