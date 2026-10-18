import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

enum LoadingBarStyle {
  case none
  case redacted
  case simple
}

@MainActor final class HomeFeedViewModel: NSObject, ObservableObject {
  let filterKey: String
  @ObservedObject var fetcher: LibraryItemFetcher
  let folderConfigs: [String: LibraryListConfig]

  @Published var isLoading = false
  @Published var itemUnderLabelEdit: Models.LibraryItem?
  @Published var itemUnderTitleEdit: Models.LibraryItem?
  @Published var itemForHighlightsView: Models.LibraryItem?
  @Published var linkRequest: LinkRequest?
  @Published var presentWebContainer = false
  @Published var showLoadingBar = LoadingBarStyle.redacted

  @Published var selectedItem: Models.LibraryItem?
  @Published var linkIsActive = false

  @Published var showLabelsSheet = false

  @Published var showAddFeedView = false
  @Published var showHideFollowingAlert = false

  @Published var filters = [InternalFilter]()

  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @Published var digestIsUnread = false

  @State var lastMoreFetched: Date?
  @State var lastFiltersFetched: Date?

  @State var isModifyingNewsletterDestination = false

  @AppStorage(UserDefaultKey.hideFeatureSection.rawValue) var hideFeatureSection = false
  @AppStorage(UserDefaultKey.stopUsingFollowingPrimer.rawValue) var stopUsingFollowingPrimer = false
  @AppStorage("LibraryTabView::hideFollowingTab") var hideFollowingTab = false
  @AppStorage("LibraryTabView::hideDigestIcon") var hideDigestIcon = false
  @AppStorage(UserDefaultKey.lastVisitedDigestId.rawValue) var lastVisitedDigestId = ""

  @AppStorage(UserDefaultKey.lastSelectedFeaturedItemFilter.rawValue) var featureFilter = 
  FeaturedItemFilter.continueReading.rawValue

  @Published var appliedFilter: InternalFilter? {
    didSet {
      if let filterName = appliedFilter?.name.lowercased() {
        UserDefaults.standard.setValue(filterName, forKey: filterKey)
      }
    }
  }

  init(filterKey: String, fetcher: LibraryItemFetcher, folderConfigs: [String: LibraryListConfig]) {
    self.filterKey = filterKey

    self.fetcher = fetcher
    self.folderConfigs = folderConfigs

    super.init()
  }

  func presentItem(item: Models.LibraryItem) {
    withAnimation {
      self.selectedItem = item
      self.linkIsActive = true
    }
  }

  func pushLinkedRequest(request: LinkRequest) {
    self.linkRequest = request
    self.presentWebContainer = true
  }

  private var filterState: FetcherFilterState? {
    if let appliedFilter = appliedFilter {
      return FetcherFilterState(
        folder: appliedFilter.folder,
        searchTerm: searchTerm,
        selectedLabels: selectedLabels,
        negatedLabels: negatedLabels,
        appliedSort: appliedSort,
        appliedFilter: appliedFilter
      )
    }
    return nil
  }

  var currentFolder: String? {
    appliedFilter?.folder
  }

  var currentListConfig: LibraryListConfig? {
    if let currentFolder = currentFolder {
      return folderConfigs[currentFolder]
    }
    return nil
  }

  func loadFilters(dataService: DataService) async {
    let start = Date()
    var hasLocalResults = false
    let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()

    if let lastFiltersFetched, lastFiltersFetched.timeIntervalSinceNow > -100 {
      print("skipping fetching filters as last fetch was too recent: ", lastFiltersFetched)
      return
    }

    // Load from disk
    if let results = try? dataService.viewContext.fetch(fetchRequest) {
      hasLocalResults = true
      updateFilters(newFilters: InternalFilter.make(from: results))
    }

    let hasResults = hasLocalResults
    if let downloadedFilters = try? await dataService.filters() {
      updateFilters(newFilters: downloadedFilters)
    } else if !hasResults {
      updateFilters(newFilters: InternalFilter.DefaultInboxFilters)
    }

    lastFiltersFetched = start
  }

  func loadMore(dataService: DataService, loadCursor: String? = nil) async {
    if let filterState = filterState {
      if isLoading { return }

      let start = Date.now
      if let lastMoreFetched, lastMoreFetched.timeIntervalSinceNow > -4 {
        print("skipping fetching more as last fetch was too recent: ", lastMoreFetched)
        return
      }

      isLoading = true
      await fetcher.loadMoreItems(dataService: dataService, filterState: filterState, loadCursor: loadCursor)
      isLoading = false

      lastMoreFetched = start
    }
  }

  func pushFeedItem(item _: Models.LibraryItem) {
    /// TODO: jackson
    //   fetcher.items.insert(item, at: 0)
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

  var defaultFilters: [InternalFilter] {
    [InternalFilter.InboxUnreadFilter,
     InternalFilter.InboxDeletedFilter,
     InternalFilter.InboxDownloadedFilter]
      + InternalFilter.DefaultFollowingFilters
  }

  func updateFilters(newFilters: [InternalFilter]) {
    let availableFolders = folderConfigs.keys
    let appliedFilterName = UserDefaults.standard.string(forKey: filterKey)

    filters = (defaultFilters + newFilters)
      .filter { availableFolders.contains($0.folder) }
      .sorted(by: { $0.position < $1.position })

    if let newFilter = filters.first(where: { $0.name.lowercased() == appliedFilterName }), newFilter.id != appliedFilter?.id {
      appliedFilter = newFilter
    }
  }

  func setDefaultFilter() {
    let availableFolders = folderConfigs.keys
    let appliedFilterName = UserDefaults.standard.string(forKey: filterKey)
    if let newFilter = filters.first(where: { $0.name.lowercased() == appliedFilterName }), newFilter.id != appliedFilter?.id {
      appliedFilter = newFilter
      return
    }

    if let defaultFilter = filters.first(where: { availableFolders.contains($0.folder) }) {
      appliedFilter = defaultFilter
    }
  }

  func loadNewItems(dataService: DataService) async {
    if let filterState = filterState {
      await fetcher.loadNewItems(
        dataService: dataService,
        filterState: filterState
      )
      objectWillChange.send()
    }
  }

  func loadItems(dataService: DataService, isRefresh: Bool, forceRemote: Bool = false, loadingBarStyle: LoadingBarStyle? = nil) async {
    isLoading = true
    showLoadingBar = .simple // isRefresh ? loadingBarStyle ?? .redacted : .none

    if let filterState = filterState {
      await fetcher.loadItems(
        dataService: dataService,
        filterState: filterState,
        isRefresh: isRefresh,
        forceRemote: forceRemote
      )
    }

    isLoading = false
    showLoadingBar = .none
  }

  func loadFeatureItems(context: NSManagedObjectContext, predicate: NSPredicate, sort: NSSortDescriptor) async -> [Models.LibraryItem] {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.fetchLimit = 25
    fetchRequest.predicate = predicate
    fetchRequest.sortDescriptors = [sort]

    do {
      let fetched = try context.fetch(fetchRequest)
      return fetched
    } catch {
      print("ERROR FETCHING: ", error)
    }
    return []
//    return (try? context.fetch(fetchRequest)) ?? []
  }

  func snackbar(_ message: String, undoAction: SnackbarUndoAction? = nil) {
    Snackbar.show(message: message, undoAction: undoAction, dismissAfter: 2000)
  }

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    archiveLibraryItemAction(dataService: dataService, objectID: objectID, archived: archived)
  }

  func removeLibraryItem(dataService: DataService, objectID: NSManagedObjectID) {
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

  func addLabel(dataService: DataService, item: Models.LibraryItem, label: String, color: String) {
    if let label = getOrCreateLabel(dataService: dataService, named: "Pinned", color: color) {
      let existingLabels = item.labels?.allObjects.compactMap { $0 as? LinkedItemLabel } ?? []
      dataService.setItemLabels(itemID: item.unwrappedID, labels: InternalLinkedItemLabel.make(Set(existingLabels + [label]) as NSSet))

      item.update(inContext: dataService.viewContext)
      fetcher.refreshFeatureItems(dataService: dataService)
    }
  }

  func removeLabel(dataService: DataService, item: Models.LibraryItem, named: String) {
    let labels = item.labels?
      .filter { ($0 as? LinkedItemLabel)?.name != named }
      .compactMap { $0 as? LinkedItemLabel } ?? []
    dataService.setItemLabels(itemID: item.unwrappedID, labels: InternalLinkedItemLabel.make(Set(labels) as NSSet))
    item.update(inContext: dataService.viewContext)
  }

  func pinItem(dataService: DataService, item: Models.LibraryItem) {
    addLabel(dataService: dataService, item: item, label: "Pinned", color: "#0A84FF")
    fetcher.refreshFeatureItems(dataService: dataService)
  }

  func unpinItem(dataService: DataService, item: Models.LibraryItem) {
    removeLabel(dataService: dataService, item: item, named: "Pinned")
    fetcher.refreshFeatureItems(dataService: dataService)
  }

  func markRead(dataService: DataService, item: Models.LibraryItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 100, anchorIndex: 0, force: true)
  }

  func markUnread(dataService: DataService, item: Models.LibraryItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0, anchorIndex: 0, force: true)
  }

  func moveToFolder(dataService: DataService, item: Models.LibraryItem, folder: String) {
    Task {
      do {
        try await dataService.moveItem(itemID: item.unwrappedID, folder: folder)
        snackbar("Moved to library")
      } catch {
        snackbar("Error moving item to \(folder)")
      }
    }
  }

  func bulkAction(dataService: DataService, action: BulkAction, items: [String]) {
    if items.count < 1 {
      snackbar("No items selected")
      return
    }
    Task {
      do {
        try await dataService.bulkAction(action: action, items: items)
        snackbar("Operation completed")
      } catch {
        print("ERROR: ", error)
        snackbar("Error performing operation")
      }
    }
  }

  func findFilter(_: DataService, named: String) -> InternalFilter? {
    filters.first(where: { $0.name == named })
  }

  func modifyingNewsletterDestinationToFollowing(dataService: DataService) async {
    isModifyingNewsletterDestination = true
    do {
      var errorCount = 0
      let objectIDs = try await dataService.newsletterEmails()
      let newsletters = await dataService.viewContext.perform {
        let newsletters = objectIDs.compactMap { dataService.viewContext.object(with: $0) as? NewsletterEmail }
        return newsletters
      }

      for newsletter in newsletters {
        if let emailId = newsletter.emailId, newsletter.folder != "following" {
          do {
            try await dataService.updateNewsletterEmail(emailID: emailId, folder: "following")
          } catch {
            print("error updating newsletter: ", error)
            errorCount += 1
          }
        }
      }
      if errorCount > 0 {
        snackbar("There was an error modifying \(errorCount) of your emails")
      } else {
        snackbar("Email destination modified")
      }
    } catch {
      snackbar("Error modifying emails")
    }
  }

  func updateFeatureFilter(context: NSManagedObjectContext, filter: FeaturedItemFilter?) {
    if let filter = filter {
      featureFilter = filter.rawValue
      fetcher.updateFeatureFilter(context: context, filter: filter)
    }
  }

  @Published var isEmptyingTrash = false

  func emptyTrash(dataService: DataService) {
    self.isEmptyingTrash = true
    Task {
      if !(await dataService.emptyTrash()) {
        snackbar("Error emptying trash")
      } else {
        snackbar("Trash emptied")
      }
      isEmptyingTrash = false
    }
  }

  func checkForDigestUpdate(dataService: DataService) async {
    do {
      if dataService.featureFlags.digestEnabled, 
          let result = try? await dataService.getLatestDigest(timeoutInterval: 2) {
        if result.id != lastVisitedDigestId {
          digestIsUnread = true
        }
      }
    }
  }
}
