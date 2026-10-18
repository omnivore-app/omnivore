//
//  LibrarySearchViewModel.swift
//
//
//  Created by Jackson Harper on 10/10/22.
//

import CoreData
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

@MainActor final class LibrarySearchViewModel: NSObject, ObservableObject {
  @Published var items = [TypeaheadSearchItem]()
  @Published var isLoading = false
  @Published var cursor: String?
  @Published var searchTerm = ""
  @Published var linkRequest: LinkRequest?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  @AppStorage(UserDefaultKey.recentSearchTerms.rawValue) var recentSearchTerms: String = ""

  func recentSearches(dataService: DataService) -> [String] {
    var results: [String] = []
    dataService.viewContext.performAndWait {
      let request = RecentSearchItem.fetchRequest()
      let sort = NSSortDescriptor(key: #keyPath(RecentSearchItem.savedAt), ascending: false)
      request.sortDescriptors = [sort]
      request.fetchLimit = 20

      results = (try? dataService.viewContext.fetch(request))?.map { $0.term ?? "" } ?? []
    }
    return results
  }

  func saveRecentSearch(dataService: DataService, searchTerm: String) {
    let fetchRequest: NSFetchRequest<Models.RecentSearchItem> = RecentSearchItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(format: "term == %@", searchTerm)

    let item: RecentSearchItem
    if let fetchedItem = (try? dataService.viewContext.fetch(fetchRequest))?.first {
      item = fetchedItem
    } else {
      item = RecentSearchItem(context: dataService.viewContext)
    }
    item.term = searchTerm
    item.savedAt = Date()

    try? dataService.viewContext.save()
  }

  func removeRecentSearch(dataService: DataService, searchTerm: String) {
    let fetchRequest: NSFetchRequest<Models.RecentSearchItem> = RecentSearchItem.fetchRequest()
    fetchRequest.predicate = NSPredicate(format: "term == %@", searchTerm)

    let objects = try? dataService.viewContext.fetch(fetchRequest)
    for object in objects ?? [] {
      dataService.viewContext.delete(object)
    }

    try? dataService.viewContext.save()
  }

  func search(dataService: DataService, searchTerm: String, isRefresh _: Bool = false) async {
    isLoading = true
    let thisSearchIdx = searchIdx
    searchIdx += 1

    let queryResult = try? await dataService.typeaheadSearch(searchTerm: searchTerm)

    // Search results aren't guaranteed to return in order so this
    // will discard old results that are returned while a user is typing.
    // For example if a user types 'Canucks', often the search results
    // for 'C' are returned after 'Canucks' because it takes the backend
    // much longer to compute.
    if thisSearchIdx > 0, thisSearchIdx <= receivedIdx {
      return
    }

    if let queryResult = queryResult {
      items = queryResult

      isLoading = false
      receivedIdx = thisSearchIdx
    }

    isLoading = false
  }
}
