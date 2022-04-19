import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class HomeFeedViewModel: ObservableObject {
  var currentDetailViewModel: LinkItemDetailViewModel?

  /// Track progress updates to be committed when user navigates back to grid view
  var uncommittedReadingProgressUpdates = [String: Double]()

  /// Track label updates to be committed when user navigates back to grid view
  var uncommittedLabelUpdates = [String: [FeedItemLabelDep]]()

  @Published var items = [FeedItemDep]()
  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  @Published var itemUnderLabelEdit: FeedItemDep?
  @Published var searchTerm = ""
  @Published var selectedLabels = [FeedItemLabelDep]()
  @Published var snoozePresented = false
  @Published var itemToSnooze: FeedItemDep?
  @Published var selectedLinkItem: FeedItemDep?

  var cursor: String?
  var sendProgressUpdates = false

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  var subscriptions = Set<AnyCancellable>()

  init() {}

  func itemAppeared(item: FeedItemDep, dataService: DataService) {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    if let itemIndex = itemIndex, itemIndex > thresholdIndex, items.count < thresholdIndex + 10 {
      loadItems(dataService: dataService, isRefresh: false)
    }
  }

  func pushFeedItem(item: FeedItemDep) {
    items.insert(item, at: 0)
  }

  func loadItems(dataService: DataService, isRefresh: Bool) {
    // Clear offline highlights since we'll be populating new FeedItems with the correct highlights set
    dataService.clearHighlights()

    let thisSearchIdx = searchIdx
    searchIdx += 1

    isLoading = true

    // Cache the viewer

    if dataService.currentViewer == nil {
      Task { _ = try? await dataService.fetchViewer() }
    }

    dataService.libraryItemsPublisher(
      limit: 10,
      sortDescending: true,
      searchQuery: searchQuery,
      cursor: isRefresh ? nil : cursor
    )
    .sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        self?.isLoading = false
        // return cachedItems found in CoreData when request fails
        self?.items = dataService.cachedFeedItems()
        self?.cursor = nil
      },
      receiveValue: { [weak self] result in
        // Search results aren't guaranteed to return in order so this
        // will discard old results that are returned while a user is typing.
        // For example if a user types 'Canucks', often the search results
        // for 'C' are returned after 'Canucks' because it takes the backend
        // much longer to compute.
        if thisSearchIdx > 0, thisSearchIdx <= self?.receivedIdx ?? 0 {
          return
        }

        dataService.prefetchPages(items: result.items)

        self?.items = isRefresh ? result.items : (self?.items ?? []) + result.items
        self?.isLoading = false
        self?.receivedIdx = thisSearchIdx
        self?.cursor = result.cursor
      }
    )
    .store(in: &subscriptions)
  }

  func setLinkArchived(dataService: DataService, linkId: String, archived: Bool) {
    isLoading = true

    // First remove the link from the internal list,
    // then make a call to remove it. The isLoading block should
    // prevent our local change from being overwritten, but we
    // might need to cache a local list of archived links
    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    dataService.archiveLinkPublisher(itemID: linkId, archived: archived)
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case .failure = completion else { return }
          self?.isLoading = false
          NSNotification.operationFailed(message: archived ? "Failed to archive link" : "Failed to unarchive link")
        },
        receiveValue: { [weak self] _ in
          self?.isLoading = false
          Snackbar.show(message: archived ? "Link archived" : "Link moved to Inbox")
        }
      )
      .store(in: &subscriptions)
  }

  func removeLink(dataService: DataService, linkId: String) {
    isLoading = true

    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    dataService.removeLinkPublisher(itemID: linkId)
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case .failure = completion else { return }
          self?.isLoading = false
          Snackbar.show(message: "Failed to remove link")
        },
        receiveValue: { [weak self] _ in
          self?.isLoading = false
          Snackbar.show(message: "Link removed")
        }
      )
      .store(in: &subscriptions)
  }

  func snoozeUntil(dataService: DataService, linkId: String, until: Date, successMessage: String?) {
    isLoading = true

    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    dataService.createReminderPublisher(
      reminderItemId: .link(id: linkId),
      remindAt: until
    )
    .sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        self?.isLoading = false
        NSNotification.operationFailed(message: "Failed to snooze")
      },
      receiveValue: { [weak self] _ in
        self?.isLoading = false
        if let message = successMessage {
          Snackbar.show(message: message)
        }
      }
    )
    .store(in: &subscriptions)
  }

  /// Update `FeedItem`s with the cached reading progress and label values so it can animate when the
  /// user navigates back to the grid view (and also avoid mutations of the grid items
  /// that can cause the `NavigationView` to pop.
  func commitItemUpdates() {
    for (key, value) in uncommittedReadingProgressUpdates {
      updateProgress(itemID: key, progress: value)
    }
    for (key, value) in uncommittedLabelUpdates {
      updateLabels(itemID: key, labels: value)
    }
    uncommittedReadingProgressUpdates = [:]
    uncommittedLabelUpdates = [:]
  }

  private func updateProgress(itemID: String, progress: Double) {
    guard sendProgressUpdates, let item = items.first(where: { $0.id == itemID }) else { return }
    if let index = items.firstIndex(of: item) {
      items[index].readingProgress = progress
    }
  }

  func updateLabels(itemID: String, labels: [FeedItemLabelDep]) {
    // If item is being being displayed then delay the state update of labels until
    // user is no longer reading the item.
    if selectedLinkItem != nil {
      uncommittedLabelUpdates[itemID] = labels
      return
    }

    guard let item = items.first(where: { $0.id == itemID }) else { return }
    if let index = items.firstIndex(of: item) {
      items[index].labels = labels
    }
  }

  private var searchQuery: String? {
    if searchTerm.isEmpty, selectedLabels.isEmpty {
      return nil
    }

    var query = searchTerm

    if !selectedLabels.isEmpty {
      query.append(" label:")
      query.append(selectedLabels.map(\.name).joined(separator: ","))
    }

    return query
  }
}
