import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class HomeFeedViewModel: ObservableObject {
  var currentDetailViewModel: LinkItemDetailViewModel?

  @Published var items = [LinkedItem]()
  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  @Published var itemUnderLabelEdit: LinkedItem?
  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var snoozePresented = false
  @Published var itemToSnoozeID: String?
  @Published var selectedLinkItem: LinkedItem?
  @Published var showLoadingBar = false
  @Published var appliedFilter = LinkedItemFilter.inbox

  var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  init() {}

  func itemAppeared(item: LinkedItem, dataService: DataService) async {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    if let itemIndex = itemIndex, itemIndex > thresholdIndex, items.count < thresholdIndex + 10 {
      await loadItems(dataService: dataService, isRefresh: false)
    }
  }

  func pushFeedItem(item: LinkedItem) {
    items.insert(item, at: 0)
  }

  func loadItems(dataService: DataService, isRefresh: Bool) async {
    let thisSearchIdx = searchIdx
    searchIdx += 1

    isLoading = true
    showLoadingBar = true

    // Cache the viewer
    if dataService.currentViewer == nil {
      Task { _ = try? await dataService.fetchViewer() }
    }

    let queryResult = try? await dataService.fetchLinkedItems(
      limit: 10,
      searchQuery: searchQuery,
      cursor: isRefresh ? nil : cursor
    )

    // Search results aren't guaranteed to return in order so this
    // will discard old results that are returned while a user is typing.
    // For example if a user types 'Canucks', often the search results
    // for 'C' are returned after 'Canucks' because it takes the backend
    // much longer to compute.
    if thisSearchIdx > 0, thisSearchIdx <= receivedIdx {
      return
    }

    if let queryResult = queryResult {
      let newItems: [LinkedItem] = {
        var itemObjects = [LinkedItem]()
        dataService.viewContext.performAndWait {
          itemObjects = queryResult.items.compactMap { dataService.viewContext.object(with: $0) as? LinkedItem }
        }
        return itemObjects
      }()
      items = isRefresh ? newItems : items + newItems
      isLoading = false
      receivedIdx = thisSearchIdx
      cursor = queryResult.cursor
      await dataService.prefetchPages(itemIDs: newItems.map(\.unwrappedID))
      showLoadingBar = false
    } else if searchTerm.replacingOccurrences(of: " ", with: "").isEmpty {
      await dataService.viewContext.perform {
        let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
        fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \LinkedItem.savedAt, ascending: false)]
        fetchRequest.predicate = self.appliedFilter.predicate
//        // TODO: Filter on label

        if let fetchedItems = try? dataService.viewContext.fetch(fetchRequest) {
          self.items = fetchedItems
          self.cursor = nil
          self.isLoading = false
        }
      }
      showLoadingBar = false
    }
  }

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    // TODO: remove this by making list always fetch from Coredata
    guard let itemIndex = items.firstIndex(where: { $0.objectID == objectID }) else { return }
    items.remove(at: itemIndex)
    dataService.archiveLink(objectID: objectID, archived: archived)
    Snackbar.show(message: archived ? "Link archived" : "Link moved to Inbox")
  }

  func removeLink(dataService: DataService, objectID: NSManagedObjectID) {
    guard let itemIndex = items.firstIndex(where: { $0.objectID == objectID }) else { return }
    items.remove(at: itemIndex)
    Snackbar.show(message: "Link removed")
    dataService.removeLink(objectID: objectID)
  }

  func snoozeUntil(dataService: DataService, linkId: String, until: Date, successMessage: String?) async {
    isLoading = true

    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    do {
      try await dataService.createReminder(
        reminderItemId: .link(id: linkId),
        remindAt: until
      )

      if let message = successMessage {
        Snackbar.show(message: message)
      }
    } catch {
      NSNotification.operationFailed(message: "Failed to snooze")
    }

    isLoading = false
  }

  private var searchQuery: String {
    var query = "\(appliedFilter.queryString)"

    if !searchTerm.isEmpty {
      query.append(" \(searchTerm)")
    }

    if !selectedLabels.isEmpty {
      query.append(" label:")
      query.append(selectedLabels.map { $0.name ?? "" }.joined(separator: ","))
    }

    return query
  }
}
