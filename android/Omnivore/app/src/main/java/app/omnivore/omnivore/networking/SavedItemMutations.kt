package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SetBookmarkArticleMutation
import app.omnivore.omnivore.graphql.generated.SetLinkArchivedMutation
import app.omnivore.omnivore.graphql.generated.type.ArchiveLinkInput
import app.omnivore.omnivore.graphql.generated.type.SetBookmarkArticleInput

suspend fun Networker.deleteSavedItem(itemID: String): Boolean {
  return try {
    val input = SetBookmarkArticleInput(itemID, false)
    val result = authenticatedApolloClient().mutation(SetBookmarkArticleMutation(input)).execute()
    result.data?.setBookmarkArticle?.onSetBookmarkArticleSuccess?.bookmarkedArticle?.id != null
  } catch (e: java.lang.Exception) {
    false
  }
}

suspend fun Networker.archiveSavedItem(itemID: String): Boolean {
  return updateArchiveStatusSavedItem(itemID, true)
}

suspend fun Networker.unarchiveSavedItem(itemID: String): Boolean {
  return updateArchiveStatusSavedItem(itemID, false)
}

suspend fun Networker.updateArchiveStatusSavedItem(itemID: String, setAsArchived: Boolean): Boolean {
  return try {
    val input = ArchiveLinkInput(setAsArchived, itemID)
    val result = authenticatedApolloClient().mutation(SetLinkArchivedMutation(input)).execute()
    result.data?.setLinkArchived?.onArchiveLinkSuccess?.linkId != null
  } catch (e: java.lang.Exception) {
    false
  }
}
