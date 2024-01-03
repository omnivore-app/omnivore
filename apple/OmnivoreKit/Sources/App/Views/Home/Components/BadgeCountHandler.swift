import CoreData
import Foundation
import Models
import Services
import SwiftUI

@MainActor
enum BadgeCountHandler {
  @AppStorage("Filters::badgeFilter") public static var badgeFilter = "in:inbox"

  public static func updateBadgeCount(dataService: DataService) {
    // if let badgeFilterId = badgeFilterId {
    dataService.backgroundContext.performAndWait {
      if let filter = Filter.lookup(byFilter: badgeFilter, inContext: dataService.backgroundContext),
         let internalFilter = InternalFilter.make(from: [filter]).first
      {
        let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
        fetchRequest.predicate = internalFilter.predicate

        if let count = try? dataService.backgroundContext.count(for: fetchRequest) {
          UIApplication.shared.applicationIconBadgeNumber = count
        }
      }
    }
  }
}
