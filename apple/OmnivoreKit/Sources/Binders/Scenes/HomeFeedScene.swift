import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

extension HomeFeedViewModel {
  static func make(services: Services) -> HomeFeedViewModel {
    let viewModel = HomeFeedViewModel { feedItem in
      LinkItemDetailViewModel.make(feedItem: feedItem, services: services)
    }

    viewModel.bind(services: services)
    viewModel.loadItems(dataService: services.dataService, searchQuery: nil, isRefresh: false)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case let .refreshItems(query: query):
        self?.loadItems(dataService: services.dataService, searchQuery: query, isRefresh: true)
      case let .loadItems(query):
        self?.loadItems(dataService: services.dataService, searchQuery: query, isRefresh: false)
      case let .archive(linkId):
        self?.setLinkArchived(dataService: services.dataService, linkId: linkId, archived: true)
      case let .unarchive(linkId):
        self?.setLinkArchived(dataService: services.dataService, linkId: linkId, archived: false)
      case let .remove(linkId):
        self?.removeLink(dataService: services.dataService, linkId: linkId)
      case let .snooze(linkId, until, successMessage):
        self?.snoozeUntil(
          dataService: services.dataService,
          linkId: linkId,
          until: until,
          successMessage: successMessage
        )
      }
    }
    .store(in: &subscriptions)
  }

  private func loadItems(dataService: DataService, searchQuery: String?, isRefresh: Bool) {
    // Clear offline highlights since we'll be populating new FeedItems with the correct highlights set
    dataService.clearHighlights()

    let thisSearchIdx = searchIdx
    searchIdx += 1

    isLoading = true
    startNetworkActivityIndicator()

    // Cache the viewer
    if dataService.currentViewer == nil {
      dataService.viewerPublisher().sink(
        receiveCompletion: { _ in },
        receiveValue: { _ in }
      )
      .store(in: &subscriptions)
    }

    dataService.libraryItemsPublisher(
      limit: 10,
      sortDescending: true,
      searchQuery: searchQuery,
      cursor: isRefresh ? nil : cursor
    )
    .sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.isLoading = false
        stopNetworkActivityIndicator()
        print(error)
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
        self?.items = isRefresh ? result.items : (self?.items ?? []) + result.items
        self?.isLoading = false
        self?.receivedIdx = thisSearchIdx
        self?.cursor = result.cursor
        stopNetworkActivityIndicator()
      }
    )
    .store(in: &subscriptions)
  }

  private func setLinkArchived(dataService: DataService, linkId: String, archived: Bool) {
    isLoading = true
    startNetworkActivityIndicator()

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
          guard case let .failure(error) = completion else { return }
          self?.isLoading = false
          stopNetworkActivityIndicator()
          print(error)
          NSNotification.operationFailed(message: archived ? "Failed to archive link" : "Failed to unarchive link")
        },
        receiveValue: { [weak self] _ in
          self?.isLoading = false
          stopNetworkActivityIndicator()
          NSNotification.operationSuccess(message: archived ? "Link archived" : "Link moved to Inbox")
        }
      )
      .store(in: &subscriptions)
  }

  private func removeLink(dataService: DataService, linkId: String) {
    isLoading = true
    startNetworkActivityIndicator()

    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    dataService.removeLinkPublisher(itemID: linkId)
      .sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(error) = completion else { return }
          self?.isLoading = false
          stopNetworkActivityIndicator()
          print(error)
          NSNotification.operationFailed(message: "Failed to remove link")
        },
        receiveValue: { [weak self] _ in
          self?.isLoading = false
          stopNetworkActivityIndicator()
          NSNotification.operationSuccess(message: "Link removed")
        }
      )
      .store(in: &subscriptions)
  }

  private func snoozeUntil(dataService: DataService, linkId: String, until: Date, successMessage: String?) {
    isLoading = true
    startNetworkActivityIndicator()

    if let itemIndex = items.firstIndex(where: { $0.id == linkId }) {
      items.remove(at: itemIndex)
    }

    dataService.createReminderPublisher(
      reminderItemId: .link(id: linkId),
      remindAt: until
    )
    .sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.isLoading = false
        stopNetworkActivityIndicator()
        print(error)
        NSNotification.operationFailed(message: "Failed to snooze")
      },
      receiveValue: { [weak self] _ in
        self?.isLoading = false
        stopNetworkActivityIndicator()
        if let message = successMessage {
          NSNotification.operationSuccess(message: message)
        }
      }
    )
    .store(in: &subscriptions)
  }
}

private func startNetworkActivityIndicator() {
  #if os(iOS)
    UIApplication.shared.isNetworkActivityIndicatorVisible = true
  #endif
}

private func stopNetworkActivityIndicator() {
  #if os(iOS)
    UIApplication.shared.isNetworkActivityIndicatorVisible = false
  #endif
}
