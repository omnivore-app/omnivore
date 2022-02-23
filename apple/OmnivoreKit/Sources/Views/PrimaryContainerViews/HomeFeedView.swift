import Combine
import Models
import SwiftUI
import Utils

public final class HomeFeedViewModel: ObservableObject {
  let detailViewModelCreator: (FeedItem) -> LinkItemDetailViewModel
  var currentDetailViewModel: LinkItemDetailViewModel?

  @Published public var items = [FeedItem]()
  @Published public var isLoading = false
  @Published public var showPushNotificationPrimer = false
  public var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  public var searchIdx = 0
  public var receivedIdx = 0

  public enum Action {
    case refreshItems(query: String)
    case loadItems(query: String)
    case archive(linkId: String)
    case unarchive(linkId: String)
    case remove(linkId: String)
    case snooze(linkId: String, until: Date, successMessage: String?)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(detailViewModelCreator: @escaping (FeedItem) -> LinkItemDetailViewModel) {
    self.detailViewModelCreator = detailViewModelCreator
  }

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

public struct HomeFeedView: View {
  @ObservedObject private var viewModel: HomeFeedViewModel
  @State private var selectedLinkItem: FeedItem?
  @State private var searchQuery = ""
  @State private var itemToRemove: FeedItem?
  @State private var confirmationShown = false
  @State private var snoozePresented = false
  @State private var itemToSnooze: FeedItem?

  public init(viewModel: HomeFeedViewModel) {
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
              destination: LinkItemDetailView(viewModel: viewModel.detailViewModelCreator(item)),
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

  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        NavigationView {
          conditionalInnerBody
        }
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
