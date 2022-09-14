import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class HomeFeedViewModel: NSObject, ObservableObject {
  let dateFormatter = DateFormatter.formatterISO8601

  var currentDetailViewModel: LinkItemDetailViewModel?

  private var fetchedResultsController: NSFetchedResultsController<LinkedItem>?

  @Published var items = [LinkedItem]()
  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  @Published var itemUnderLabelEdit: LinkedItem?
  @Published var itemUnderTitleEdit: LinkedItem?
  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var snoozePresented = false
  @Published var itemToSnoozeID: String?
  @Published var linkRequest: LinkRequest?
  @Published var showLoadingBar = false
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @Published var selectedItem: LinkedItem?
  @Published var linkIsActive = false

  @AppStorage(UserDefaultKey.lastSelectedLinkedItemFilter.rawValue) var appliedFilter = LinkedItemFilter.inbox.rawValue

  @AppStorage(UserDefaultKey.lastItemSyncTime.rawValue) var lastItemSyncTime = DateFormatter.formatterISO8601.string(
    from: Date(timeIntervalSinceReferenceDate: 0)
  )

  func handleReaderItemNotification(objectID: NSManagedObjectID, dataService: DataService) {
    // Pop the current selected item if needed
    if selectedItem != nil, selectedItem?.objectID != objectID {
      // Temporarily disable animation to avoid excessive animations
      UIView.setAnimationsEnabled(false)

      linkIsActive = false
      selectedItem = nil

      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        self.selectedItem = dataService.viewContext.object(with: objectID) as? LinkedItem
        self.linkIsActive = true
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200)) {
        UIView.setAnimationsEnabled(true)
      }
    } else {
      selectedItem = dataService.viewContext.object(with: objectID) as? LinkedItem
      linkIsActive = true
    }
  }

  func handleReaderItemNavigationNotification(dataService _: DataService, direction: Int) {
    // Pop the current selected item if needed
    if selectedItem != nil {
      // Temporarily disable animation to avoid excessive animations
      UIView.setAnimationsEnabled(false)

      let toItem = getOffsetFeedItem(direction: direction)
      linkIsActive = false
      selectedItem = nil

      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        self.selectedItem = toItem
        self.linkIsActive = true
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200)) {
        UIView.setAnimationsEnabled(true)
      }
    } else {
      selectedItem = getOffsetFeedItem(direction: direction)
      linkIsActive = true
    }
  }

  func getOffsetFeedItem(direction: Int) -> LinkedItem? {
    if let selectedItem = selectedItem, let currentIdx = items.firstIndex(of: selectedItem) {
      let newIdx = (currentIdx + direction) % items.count
      let res = items[newIdx]
      return res
    }
    return nil
  }

  var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  func itemAppeared(item: LinkedItem, dataService: DataService, audioController: AudioController) async {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    if let itemIndex = itemIndex, itemIndex > thresholdIndex, items.count < thresholdIndex + 10 {
      await loadItems(dataService: dataService, audioController: audioController, isRefresh: false)
    }
  }

  func pushFeedItem(item: LinkedItem) {
    items.insert(item, at: 0)
  }

  func loadItems(dataService: DataService, audioController: AudioController, isRefresh: Bool) async {
    let syncStartTime = Date()
    let thisSearchIdx = searchIdx
    searchIdx += 1

    isLoading = true
    showLoadingBar = true

    // Cache the viewer
    if dataService.currentViewer == nil {
      Task { _ = try? await dataService.fetchViewer() }
    }

    // Fetch labels if none are available locally
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.fetchLimit = 1

    if (try? dataService.viewContext.count(for: fetchRequest)) == 0 {
      _ = try? await dataService.labels()
    }

    // Sync items if necessary
    let lastSyncDate = dateFormatter.date(from: lastItemSyncTime) ?? Date(timeIntervalSinceReferenceDate: 0)
    let syncResult = try? await dataService.syncLinkedItems(since: lastSyncDate, cursor: nil)
    if syncResult != nil {
      lastItemSyncTime = dateFormatter.string(from: syncStartTime)
    }

    let queryResult = try? await dataService.loadLinkedItems(
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
          itemObjects = queryResult.itemIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItem }
        }
        return itemObjects
      }()

      if searchTerm.replacingOccurrences(of: " ", with: "").isEmpty {
        updateFetchController(dataService: dataService)
      } else {
        // Don't use FRC for searching. Use server results directly.
        if fetchedResultsController != nil {
          fetchedResultsController = nil
          items = []
        }
        items = isRefresh ? newItems : items + newItems
      }

      isLoading = false
      receivedIdx = thisSearchIdx
      cursor = queryResult.cursor
      if let username = dataService.currentViewer?.username {
        await dataService.prefetchPages(itemIDs: newItems.map(\.unwrappedID), username: username)
        // Only preload the first item in the list. We are doing this during the beta
        // because it will kick off the user's future items being automatically transcribed.
        // This happens because when an article is saved, we check if the user has a recent
        // listen. If they do, we will automatically transcribe their message.
        if let first = newItems.first?.id {
          _ = await audioController.preload(itemIDs: [first])
        }
      }
    } else {
      updateFetchController(dataService: dataService)
    }

    isLoading = false
    showLoadingBar = false
  }

  func downloadAudio(audioController: AudioController, item: LinkedItem) {
    Snackbar.show(message: "Downloading Offline Audio")
    Task {
      let downloaded = await audioController.downloadForOffline(itemID: item.unwrappedID)
      Snackbar.show(message: downloaded ? "Audio file downloaded" : "Error downloading audio")
    }
  }

  private var fetchRequest: NSFetchRequest<Models.LinkedItem> {
    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()

    var subPredicates = [NSPredicate]()

    subPredicates.append((LinkedItemFilter(rawValue: appliedFilter) ?? .inbox).predicate)

    if !selectedLabels.isEmpty {
      var labelSubPredicates = [NSPredicate]()

      for label in selectedLabels {
        labelSubPredicates.append(
          NSPredicate(format: "SUBQUERY(labels, $label, $label.id == \"\(label.unwrappedID)\").@count > 0")
        )
      }

      subPredicates.append(NSCompoundPredicate(orPredicateWithSubpredicates: labelSubPredicates))
    }

    if !negatedLabels.isEmpty {
      var labelSubPredicates = [NSPredicate]()

      for label in negatedLabels {
        labelSubPredicates.append(
          NSPredicate(format: "SUBQUERY(labels, $label, $label.id == \"\(label.unwrappedID)\").@count == 0")
        )
      }

      subPredicates.append(NSCompoundPredicate(orPredicateWithSubpredicates: labelSubPredicates))
    }

    fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: subPredicates)
    fetchRequest.sortDescriptors = (LinkedItemSort(rawValue: appliedSort) ?? .newest).sortDescriptors

    return fetchRequest
  }

  private func updateFetchController(dataService: DataService) {
    fetchedResultsController = NSFetchedResultsController(
      fetchRequest: fetchRequest,
      managedObjectContext: dataService.viewContext,
      sectionNameKeyPath: nil,
      cacheName: nil
    )

    guard let fetchedResultsController = fetchedResultsController else {
      return
    }

    fetchedResultsController.delegate = self
    try? fetchedResultsController.performFetch()
    items = fetchedResultsController.fetchedObjects ?? []
  }

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    dataService.archiveLink(objectID: objectID, archived: archived)
    Snackbar.show(message: archived ? "Link archived" : "Link moved to Inbox")
  }

  func removeLink(dataService: DataService, objectID: NSManagedObjectID) {
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
    let filter = LinkedItemFilter(rawValue: appliedFilter) ?? .inbox
    let sort = LinkedItemSort(rawValue: appliedSort) ?? .newest
    var query = "\(filter.queryString) \(sort.queryString)"

    if !searchTerm.isEmpty {
      query.append(" \(searchTerm)")
    }

    if !selectedLabels.isEmpty {
      query.append(" label:")
      query.append(selectedLabels.map { $0.name ?? "" }.joined(separator: ","))
    }

    if !negatedLabels.isEmpty {
      query.append(" !label:")
      query.append(negatedLabels.map { $0.name ?? "" }.joined(separator: ","))
    }

    return query
  }
}

extension HomeFeedViewModel: NSFetchedResultsControllerDelegate {
  func controllerDidChangeContent(_ controller: NSFetchedResultsController<NSFetchRequestResult>) {
    items = controller.fetchedObjects as? [LinkedItem] ?? []
  }
}
