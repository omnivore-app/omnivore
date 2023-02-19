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

  val queryParams = LibraryLiveDataQueryParams.make(primaryFilter)

  return when (sortFilter) {
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

//switch self {
//  case .inbox:
//  // non-archived items
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])

//  case .readlater:
//  // non-archived or deleted items without the Newsletter label
//  let nonNewsletterLabelPredicate = NSPredicate(
//    format: "NOT SUBQUERY(labels, $label, $label.name == \"Newsletter\") .@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [
//    undeletedPredicate, notInArchivePredicate, nonNewsletterLabelPredicate
//  ])
//  case .newsletters:
//  // non-archived or deleted items with the Newsletter label
//  let newsletterLabelPredicate = NSPredicate(
//    format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, newsletterLabelPredicate])
//  case .recommended:
//  // non-archived or deleted items with the Newsletter label
//  let recommendedPredicate = NSPredicate(
//    format: "recommendations.@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, recommendedPredicate])
//  case .all:
//  // include everything undeleted
//  return undeletedPredicate
//  case .archived:
//  let inArchivePredicate = NSPredicate(
//    format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: true) as NSNumber
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
//  case .files:
//  // include pdf only
//  let isPDFPredicate = NSPredicate(
//    format: "%K == %@", #keyPath(LinkedItem.contentReader), "PDF"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate])
//  case .hasHighlights:
//  let hasHighlightsPredicate = NSPredicate(
//    format: "highlights.@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [
//    hasHighlightsPredicate
//  ])
//}
//}
//}
