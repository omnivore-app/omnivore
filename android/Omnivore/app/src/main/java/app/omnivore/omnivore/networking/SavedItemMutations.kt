package app.omnivore.omnivore.networking

import android.content.ContentValues
import android.net.Uri
import android.util.Log
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.graphql.generated.SaveUrlMutation
import app.omnivore.omnivore.graphql.generated.SetBookmarkArticleMutation
import app.omnivore.omnivore.graphql.generated.SetLinkArchivedMutation
import app.omnivore.omnivore.graphql.generated.type.*
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import kotlinx.coroutines.launch
import java.util.*

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

suspend fun Networker.saveUrl(url: Uri): Boolean {
  return try {
    val clientRequestId = UUID.randomUUID().toString()
    val input = SaveUrlInput(url = url.toString(), clientRequestId = clientRequestId, source = "android")
    val result = authenticatedApolloClient().mutation(SaveUrlMutation(input)).execute()
    result.data?.saveUrl?.onSaveSuccess?.url != null
  } catch (e: java.lang.Exception) {
    false
  }
}
