import Combine
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

extension HomeFeedViewModel {
  static func make(services: Services) -> HomeFeedViewModel {
    let viewModel = HomeFeedViewModel()
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

// TODO: remove this view model
final class HomeFeedViewModel: ObservableObject {
  var currentDetailViewModel: LinkItemDetailViewModel?

  @Published var items = [FeedItem]()
  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  enum Action {
    case refreshItems(query: String)
    case loadItems(query: String)
    case archive(linkId: String)
    case unarchive(linkId: String)
    case remove(linkId: String)
    case snooze(linkId: String, until: Date, successMessage: String?)
  }

  var subscriptions = Set<AnyCancellable>()
  let performActionSubject = PassthroughSubject<Action, Never>()

  init() {}

  func itemAppeared(item: FeedItem, searchQuery: String) {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    if let itemIndex = itemIndex, itemIndex > thresholdIndex, items.count < thresholdIndex + 10 {
      performActionSubject.send(.loadItems(query: searchQuery))
    }
  }

  func pushFeedItem(item: FeedItem) {
    items.insert(item, at: 0)
  }
}

struct HomeFeedView: View {
//  @EnvironmentObject var authenticator: Authenticator
//  @EnvironmentObject var dataService: DataService

  @ObservedObject private var viewModel: HomeFeedViewModel
  @State private var selectedLinkItem: FeedItem?
  @State private var searchQuery = ""
  @State private var itemToRemove: FeedItem?
  @State private var confirmationShown = false
  @State private var snoozePresented = false
  @State private var itemToSnooze: FeedItem?

  init(viewModel: HomeFeedViewModel) {
    self.viewModel = viewModel
  }

  @ViewBuilder var conditionalInnerBody: some View {
    #if os(iOS)
      if #available(iOS 15.0, *) {
        innerBody
          .refreshable {
            refresh()
          }
          .searchable(
            text: $searchQuery,
            placement: .sidebar
          ) {
            if searchQuery.isEmpty {
              Text("Inbox").searchCompletion("in:inbox ")
              Text("All").searchCompletion("in:all ")
              Text("Archived").searchCompletion("in:archive ")
              Text("Files").searchCompletion("type:file ")
            }
          }
          .onChange(of: searchQuery) { _ in
            // Maybe we should debounce this, but
            // it feels like it works ok without
            refresh()
          }
          .onSubmit(of: .search) {
            refresh()
          }
      } else {
        innerBody.toolbar {
          ToolbarItem {
            Button(
              action: { refresh() },
              label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
            )
          }
        }
      }
    #elseif os(macOS)
      innerBody.toolbar {
        ToolbarItem {
          Button(
            action: { refresh() },
            label: { Label("Refresh Feed", systemImage: "arrow.clockwise") }
          )
        }
      }
    #endif
  }

  var innerBody: some View {
    List {
      Section {
        ForEach(viewModel.items) { item in
          let link = ZStack {
            NavigationLink(
              destination: LinkItemDetailView(viewModel: LinkItemDetailViewModel(item: item)),
              tag: item,
              selection: $selectedLinkItem
            ) {
              EmptyView()
            }
            .opacity(0)
            .buttonStyle(PlainButtonStyle())
            .onAppear {
              viewModel.itemAppeared(item: item, searchQuery: searchQuery)
            }
            FeedCard(item: item)
          }.contextMenu {
            if !item.isArchived {
              Button(action: {
                withAnimation(.linear(duration: 0.4)) {
                  viewModel.performActionSubject.send(.archive(linkId: item.id))
                  if item == selectedLinkItem {
                    selectedLinkItem = nil
                  }
                }
              }, label: { Label("Archive", systemImage: "archivebox") })
            } else {
              Button(action: {
                withAnimation(.linear(duration: 0.4)) {
                  viewModel.performActionSubject.send(.unarchive(linkId: item.id))
                }
              }, label: { Label("Unarchive", systemImage: "tray.and.arrow.down.fill") })
            }
            Button {
              itemToSnooze = item
              snoozePresented = true
            } label: {
              Label { Text("Snooze") } icon: { Image.moon }
            }
          }
          #if os(iOS)
            if #available(iOS 15.0, *) {
              link
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                  if !item.isArchived {
                    Button {
                      withAnimation(.linear(duration: 0.4)) {
                        viewModel.performActionSubject.send(.archive(linkId: item.id))
                      }
                    } label: {
                      Label("Archive", systemImage: "archivebox")
                    }.tint(.green)
                  } else {
                    Button {
                      withAnimation(.linear(duration: 0.4)) {
                        viewModel.performActionSubject.send(.unarchive(linkId: item.id))
                      }
                    } label: {
                      Label("Unarchive", systemImage: "tray.and.arrow.down.fill")
                    }.tint(.indigo)
                  }
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                  Button(
                    role: .destructive,
                    action: {
                      itemToRemove = item
                      confirmationShown = true
                    },
                    label: {
                      Image(systemName: "trash")
                    }
                  )
                }.alert("Are you sure?", isPresented: $confirmationShown) {
                  Button("Remove Link", role: .destructive) {
                    if let itemToRemove = itemToRemove {
                      withAnimation {
                        viewModel.performActionSubject.send(.remove(linkId: itemToRemove.id))
                      }
                    }
                    self.itemToRemove = nil
                  }
                  Button("Cancel", role: .cancel) { self.itemToRemove = nil }
                }
//                .swipeActions(edge: .leading, allowsFullSwipe: true) {
//                  Button {
//                    itemToSnooze = item
//                    snoozePresented = true
//                  } label: {
//                    Label { Text("Snooze") } icon: { Image.moon }
//                  }.tint(.appYellow48)
//                }
            } else {
              link
            }
          #elseif os(macOS)
            link
          #endif
        }
      }

      if viewModel.isLoading {
        Section {
          HStack(alignment: .center) {
            Spacer()
            Text("Loading...")
            Spacer()
          }
          .frame(maxWidth: .infinity)
        }
      }
    }
    .listStyle(PlainListStyle())
    .navigationTitle("Home")
    #if os(iOS)
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        // Don't refresh the list if the user is currently reading an article
        if selectedLinkItem == nil {
          refresh()
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushFeedItem"))) { notification in
        if let feedItem = notification.userInfo?["feedItem"] as? FeedItem {
          viewModel.pushFeedItem(item: feedItem)
          self.selectedLinkItem = feedItem
        }
      }
      .formSheet(isPresented: $snoozePresented) {
        SnoozeView(snoozePresented: $snoozePresented, itemToSnooze: $itemToSnooze) {
          viewModel.performActionSubject.send(
            .snooze(linkId: $0.feedItemId, until: $0.snoozeUntilDate, successMessage: $0.successMessage)
          )
        }
      }
    #endif
    .onAppear {
      if viewModel.items.isEmpty {
        refresh()
      }
    }
  }

  var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        NavigationView {
          conditionalInnerBody
            .toolbar {
              ToolbarItem {
                NavigationLink(
                  destination: { ProfileContainerView() },
                  label: {
                    Image.profile
                      .resizable()
                      .frame(width: 26, height: 26)
                      .padding()
                  }
                )
              }
            }
        }
        .accentColor(.appGrayTextContrast)
      } else {
        conditionalInnerBody
      }
    #elseif os(macOS)
      conditionalInnerBody
    #endif
  }

  private func refresh() {
    viewModel.performActionSubject.send(.refreshItems(query: searchQuery))
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
