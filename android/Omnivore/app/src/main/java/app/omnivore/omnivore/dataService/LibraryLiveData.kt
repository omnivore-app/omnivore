package app.omnivore.omnivore.dataService

import androidx.lifecycle.LiveData
import androidx.lifecycle.MediatorLiveData
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.SavedItemFilter
import app.omnivore.omnivore.ui.library.SavedItemSortFilter

fun DataService.libraryLiveData(
  primaryFilter: SavedItemFilter,
  sortFilter: SavedItemSortFilter,
  labels: List<SavedItemLabel>
): LiveData<List<SavedItemCardDataWithLabels>> {
  val mediatorLiveData = MediatorLiveData<List<SavedItemCardDataWithLabels>>()
  val queryParams = LibraryLiveDataQueryParams.make(primaryFilter)

  val libraryLiveData = when (sortFilter) {
    SavedItemSortFilter.NEWEST -> db.savedItemDao().getLibraryLiveData(
      archiveFilter = queryParams.archiveFilter
    )
    SavedItemSortFilter.OLDEST -> db.savedItemDao().getLibraryLiveDataSortedByOldest(
      archiveFilter = queryParams.archiveFilter
    )
    SavedItemSortFilter.RECENTLY_READ -> db.savedItemDao().getLibraryLiveDataSortedByRecentlyRead(
      archiveFilter = queryParams.archiveFilter
    )
    SavedItemSortFilter.RECENTLY_PUBLISHED -> db.savedItemDao().getLibraryLiveDataSortedByRecentlyPublished(
      archiveFilter = queryParams.archiveFilter
    )
  }

  mediatorLiveData.addSource(libraryLiveData) { result ->
    when (primaryFilter) {
      SavedItemFilter.INBOX -> {
        mediatorLiveData.value = result
      }
      SavedItemFilter.READ_LATER -> {
        mediatorLiveData.value = result.filter { item ->
          !item.labels.any { it.name.lowercase() == "newsletter" }
        }
      }
      SavedItemFilter.NEWSLETTERS -> {
        mediatorLiveData.value = result.filter { item ->
          item.labels.any { it.name.lowercase() == "newsletter" }
        }
      }
      SavedItemFilter.RECOMMENDED -> {
        mediatorLiveData.value = result // TODO: "recommendations.@count > 0"
      }
      SavedItemFilter.ALL -> {
        mediatorLiveData.value = result
      }
      SavedItemFilter.ARCHIVED -> {
        mediatorLiveData.value = result
      }
      SavedItemFilter.HAS_HIGHLIGHTS -> {
        mediatorLiveData.value = result // TODO: "highlights.@count > 0"
      }
      SavedItemFilter.FILES -> {
        mediatorLiveData.value = result.filter { item ->
          item.cardData.contentReader == "PDF"
        }
      }
    }
  }

  return mediatorLiveData
}

private data class LibraryLiveDataQueryParams(
  val archiveFilter: Int
) {
  companion object {
    fun make(savedItemFilter: SavedItemFilter): LibraryLiveDataQueryParams {
      return when (savedItemFilter) {
        SavedItemFilter.INBOX -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
        SavedItemFilter.READ_LATER -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
        SavedItemFilter.NEWSLETTERS -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
        SavedItemFilter.RECOMMENDED -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
        SavedItemFilter.ALL -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 2, // Don't filter anything out (2 will not match anything)
          )
        }
        SavedItemFilter.ARCHIVED -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 0, // Filter out items not marked as archived
          )
        }
        SavedItemFilter.HAS_HIGHLIGHTS -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
        SavedItemFilter.FILES -> {
          LibraryLiveDataQueryParams(
            archiveFilter = 1, // Filter out items marked as archive
          )
        }
      }
    }
  }
}
