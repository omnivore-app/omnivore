package app.omnivore.omnivore.dataService

import android.util.Log
import androidx.lifecycle.LiveData
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.SavedItemFilter
import app.omnivore.omnivore.ui.library.SavedItemSortFilter

fun DataService.libraryLiveData(
  primaryFilter: SavedItemFilter,
  sortFilter: SavedItemSortFilter,
  labels: List<SavedItemLabel>
): LiveData<List<SavedItemCardDataWithLabels>> {
  Log.d("lld", "primaryFilter: $primaryFilter, labels: $labels")
  return when (sortFilter) {
    SavedItemSortFilter.NEWEST -> db.savedItemDao().getLibraryLiveData()
    SavedItemSortFilter.OLDEST -> db.savedItemDao().getLibraryLiveDataSortedByOldest()
    SavedItemSortFilter.RECENTLY_READ -> db.savedItemDao().getLibraryLiveDataSortedByRecentlyRead()
    SavedItemSortFilter.RECENTLY_PUBLISHED -> db.savedItemDao().getLibraryLiveDataSortedByRecentlyPublished()
  }
}
