package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SetBookmarkArticleMutation
import app.omnivore.omnivore.graphql.generated.SetLinkArchivedMutation
import app.omnivore.omnivore.graphql.generated.type.ArchiveLinkInput
import app.omnivore.omnivore.graphql.generated.type.SetBookmarkArticleInput

suspend fun Networker.deleteLinkedItem(itemID: String): Boolean {
  val input = SetBookmarkArticleInput(itemID, false)
  val result = authenticatedApolloClient().mutation(SetBookmarkArticleMutation(input)).execute()
  return result.data?.setBookmarkArticle?.onSetBookmarkArticleSuccess?.bookmarkedArticle?.id != null
}

suspend fun Networker.archiveLinkedItem(itemID: String): Boolean {
  return updateArchiveStatusLinkedItem(itemID, true)
}

suspend fun Networker.unarchiveLinkedItem(itemID: String): Boolean {
  return updateArchiveStatusLinkedItem(itemID, false)
}

private suspend fun Networker.updateArchiveStatusLinkedItem(itemID: String, setAsArchived: Boolean): Boolean {
  val input = ArchiveLinkInput(setAsArchived, itemID)
  val result = authenticatedApolloClient().mutation(SetLinkArchivedMutation(input)).execute()
  return result.data?.setLinkArchived?.onArchiveLinkSuccess?.linkId != null
}
