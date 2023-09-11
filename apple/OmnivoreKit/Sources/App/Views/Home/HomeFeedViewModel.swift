import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class HomeFeedViewModel: NSObject, ObservableObject {
  var currentDetailViewModel: LinkItemDetailViewModel?

  private var fetchedResultsController: NSFetchedResultsController<LinkedItem>?

  @Published var items = [LinkedItem]()
  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  @Published var itemUnderLabelEdit: LinkedItem?
  @Published var itemUnderTitleEdit: LinkedItem?
  @Published var itemForHighlightsView: LinkedItem?
  @Published var searchTerm = ""
  @Published var scopeSelection = 0
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var snoozePresented = false
  @Published var itemToSnoozeID: String?
  @Published var linkRequest: LinkRequest?
  @Published var showLoadingBar = false
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @Published var selectedLinkItem: NSManagedObjectID? // used by mac app only
  // @Published var selectedItem: LinkedItem?
  @Published var linkIsActive = false

  @Published var showLabelsSheet = false
  @Published var showFiltersModal = false
  @Published var showCommunityModal = false
  @Published var featureItems = [LinkedItem]()

  @Published var listConfig: LibraryListConfig

  @Published var showSnackbar = false
  @Published var snackbarOperation: SnackbarOperation?

  var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  var syncCursor: String?

  @AppStorage(UserDefaultKey.hideFeatureSection.rawValue) var hideFeatureSection = false
  @AppStorage(UserDefaultKey.lastSelectedLinkedItemFilter.rawValue) var appliedFilter = LinkedItemFilter.inbox.rawValue
  @AppStorage(UserDefaultKey.lastSelectedFeaturedItemFilter.rawValue) var featureFilter = FeaturedItemFilter.continueReading.rawValue

  init(listConfig: LibraryListConfig) {
    self.listConfig = listConfig
    super.init()
  }

  func setItems(_ context: NSManagedObjectContext, _ items: [LinkedItem]) {
    self.items = items
    updateFeatureFilter(context: context, filter: FeaturedItemFilter(rawValue: featureFilter))
  }

  func updateFeatureFilter(context: NSManagedObjectContext, filter: FeaturedItemFilter?) {
    if let filter = filter {
      Task {
        featureFilter = filter.rawValue

        featureItems = await loadFeatureItems(
          context: context,
          predicate: filter.predicate,
          sort: filter.sortDescriptor
        )
      }
    } else {
      featureItems = []
    }
  }

  func itemAppeared(item: LinkedItem, dataService: DataService) async {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    // Make sure we aren't currently loading though, as this would get triggered when the first set
    // of items are presented to the user.
    if let itemIndex = itemIndex, itemIndex > thresholdIndex {
      await loadMoreItems(dataService: dataService, isRefresh: false)
    }
  }

  func pushFeedItem(item: LinkedItem) {
    items.insert(item, at: 0)
  }

  func loadCurrentViewer(dataService: DataService) async {
    // Cache the viewer
    if dataService.currentViewer == nil {
      _ = try? await dataService.fetchViewer()
    }
  }

  func loadLabels(dataService: DataService) async {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.fetchLimit = 1

    if (try? dataService.viewContext.count(for: fetchRequest)) == 0 {
      _ = try? await dataService.labels()
    }
  }

  func syncItems(dataService: DataService) async {
    let syncStart = Date.now
    let lastSyncDate = dataService.lastItemSyncTime

    try? await dataService.syncOfflineItemsWithServerIfNeeded()

    let syncResult = try? await dataService.syncLinkedItems(since: lastSyncDate,
                                                            cursor: nil)

    syncCursor = syncResult?.cursor
    if let syncResult = syncResult, syncResult.hasMore {
      dataService.syncLinkedItemsInBackground(since: lastSyncDate) {
        // Set isLoading to false here
        self.isLoading = false
      }
    } else {
      dataService.lastItemSyncTime = syncStart
    }

    // If possible start prefetching new pages in the background
    if
      let itemIDs = syncResult?.updatedItemIDs,
      let username = dataService.currentViewer?.username,
      !itemIDs.isEmpty
    {
      Task.detached(priority: .background) {
        await dataService.prefetchPages(itemIDs: itemIDs, username: username)
      }
    }
  }

  func loadSearchQuery(dataService: DataService, isRefresh: Bool) async {
    let thisSearchIdx = searchIdx
    searchIdx += 1

    if thisSearchIdx > 0, thisSearchIdx <= receivedIdx {
      return
    }

    let queryResult = try? await dataService.loadLinkedItems(
      limit: 10,
      searchQuery: searchQuery,
      cursor: isRefresh ? nil : cursor
    )

    let filter = LinkedItemFilter(rawValue: appliedFilter)

    if let queryResult = queryResult {
      let newItems: [LinkedItem] = {
        var itemObjects = [LinkedItem]()
        dataService.viewContext.performAndWait {
          itemObjects = queryResult.itemIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItem }
        }
        return itemObjects
      }()

      if searchTerm.replacingOccurrences(of: " ", with: "").isEmpty, filter?.allowLocalFetch ?? false {
        updateFetchController(dataService: dataService)
      } else {
        // Don't use FRC for searching. Use server results directly.
        if fetchedResultsController != nil {
          fetchedResultsController = nil
          setItems(dataService.viewContext, [])
        }
        setItems(dataService.viewContext, isRefresh ? newItems : items + newItems)
      }

      isLoading = false
      receivedIdx = thisSearchIdx
      cursor = queryResult.cursor
      if let username = dataService.currentViewer?.username {
        await dataService.prefetchPages(itemIDs: newItems.map(\.unwrappedID), username: username)
      }
    } else {
      updateFetchController(dataService: dataService)
    }
  }

  func loadItems(dataService: DataService, isRefresh: Bool) async {
    isLoading = true
    showLoadingBar = true

    await withTaskGroup(of: Void.self) { group in
      group.addTask { await self.loadCurrentViewer(dataService: dataService) }
      group.addTask { await self.loadLabels(dataService: dataService) }
      group.addTask { await self.syncItems(dataService: dataService) }
      group.addTask { await self.updateFetchController(dataService: dataService) }
      await group.waitForAll()
    }

    let shouldSearch = items.count < 1 || isRefresh
    if shouldSearch {
      await loadSearchQuery(dataService: dataService, isRefresh: isRefresh)
    } else {
      updateFetchController(dataService: dataService)
    }

    updateFeatureFilter(context: dataService.viewContext, filter: FeaturedItemFilter(rawValue: featureFilter))

    isLoading = false
    showLoadingBar = false
  }

  func loadMoreItems(dataService: DataService, isRefresh: Bool) async {
    isLoading = true
    showLoadingBar = true

    await loadSearchQuery(dataService: dataService, isRefresh: isRefresh)

    isLoading = false
    showLoadingBar = false
  }

  func loadFeatureItems(context: NSManagedObjectContext, predicate: NSPredicate, sort: NSSortDescriptor) async -> [LinkedItem] {
    let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
    fetchRequest.fetchLimit = 25
    fetchRequest.predicate = predicate
    fetchRequest.sortDescriptors = [sort]

    return (try? context.fetch(fetchRequest)) ?? []
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
    setItems(dataService.viewContext, fetchedResultsController.fetchedObjects ?? [])
  }

  func snackbar(_ message: String, undoAction: SnackbarUndoAction? = nil) {
    snackbarOperation = SnackbarOperation(message: message, undoAction: undoAction)
    showSnackbar = true
  }

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    dataService.archiveLink(objectID: objectID, archived: archived)
    snackbar(archived ? "Link archived" : "Link moved to Inbox")
  }

  func removeLink(dataService: DataService, objectID: NSManagedObjectID) {
    removeLibraryItemAction(dataService: dataService, objectID: objectID)
  }

  func recoverItem(dataService: DataService, itemID: String) {
    Task {
      if await dataService.recoverItem(itemID: itemID) {
        snackbar("Item recovered")
      } else {
        snackbar("Error. Check trash to recover.")
      }
    }
  }

  func getOrCreateLabel(dataService: DataService, named: String, color: String) -> LinkedItemLabel? {
    if let label = LinkedItemLabel.named(named, inContext: dataService.viewContext) {
      return label
    }
    if let labelID = try? dataService.createLabel(name: named, color: color, description: "") {
      return dataService.viewContext.object(with: labelID) as? LinkedItemLabel
      // return LinkedItemLabel.lookup(byID: labelID, inContext: dataService.viewContext)
    }
    return nil
  }

  func addLabel(dataService: DataService, item: LinkedItem, label: String, color: String) {
    if let label = getOrCreateLabel(dataService: dataService, named: "Pinned", color: color) {
      let existingLabels = item.labels?.allObjects.compactMap { ($0 as? LinkedItemLabel)?.unwrappedID } ?? []
      dataService.updateItemLabels(itemID: item.unwrappedID, labelIDs: existingLabels + [label.unwrappedID])

      item.update(inContext: dataService.viewContext)
      updateFeatureFilter(context: dataService.viewContext, filter: FeaturedItemFilter(rawValue: featureFilter))
    }
  }

  func removeLabel(dataService: DataService, item: LinkedItem, named: String) {
    let labelIds = item.labels?
      .filter { ($0 as? LinkedItemLabel)?.name != named }
      .compactMap { ($0 as? LinkedItemLabel)?.unwrappedID } ?? []
    dataService.updateItemLabels(itemID: item.unwrappedID, labelIDs: labelIds)
    item.update(inContext: dataService.viewContext)
  }

  func pinItem(dataService: DataService, item: LinkedItem) {
    addLabel(dataService: dataService, item: item, label: "Pinned", color: "#0A84FF")
    if featureFilter == FeaturedItemFilter.pinned.rawValue {
      updateFeatureFilter(context: dataService.viewContext, filter: .pinned)
    }
  }

  func unpinItem(dataService: DataService, item: LinkedItem) {
    removeLabel(dataService: dataService, item: item, named: "Pinned")
    if featureFilter == FeaturedItemFilter.pinned.rawValue {
      updateFeatureFilter(context: dataService.viewContext, filter: .pinned)
    }
  }

  func markRead(dataService: DataService, item: LinkedItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 100, anchorIndex: 0)
  }

  func markUnread(dataService: DataService, item: LinkedItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0, anchorIndex: 0)
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
        snackbar(message)
      }
    } catch {
      NSNotification.operationFailed(message: "Failed to snooze")
    }

    isLoading = false
  }

  private var queryContainsFilter: Bool {
    if searchTerm.contains("in:inbox") || searchTerm.contains("in:all") || searchTerm.contains("in:archive") {
      return true
    }

    return false
  }

  private var searchQuery: String {
    let sort = LinkedItemSort(rawValue: appliedSort) ?? .newest
    var query = sort.queryString

    if !queryContainsFilter, let filter = LinkedItemFilter(rawValue: appliedFilter) {
      query = "\(filter.queryString) \(sort.queryString)"
    }

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

    print("QUERY: `\(query)`")

    return query
  }
}

extension HomeFeedViewModel: NSFetchedResultsControllerDelegate {
  func controllerDidChangeContent(_ controller: NSFetchedResultsController<NSFetchRequestResult>) {
    setItems(controller.managedObjectContext, controller.fetchedObjects as? [LinkedItem] ?? [])
  }
}
