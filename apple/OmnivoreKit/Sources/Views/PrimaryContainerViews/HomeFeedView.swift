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

  // These are used to make sure we handle search result
  // responses in the right order
  public var searchIdx = 0
  public var receivedIdx = 0

  public enum Action {
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

  func itemAppeared(item: FeedItem) {
    if isLoading { return }
    let itemIndex = items.firstIndex(where: { $0.id == item.id })
    let thresholdIndex = items.index(items.endIndex, offsetBy: -5)

    // Check if user has scrolled to the last five items in the list
    if itemIndex == thresholdIndex {
      print("load more items triggered") // TODO: fix loading mechanism
      //      performActionSubject.send(.loadItems)
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
  @State var navigationController: UINavigationController?
  @State var tabBarController: UITabBarController?

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
              viewModel.itemAppeared(item: item)
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
        snoozeView
      }
    #endif
    .onAppear {
      if viewModel.items.isEmpty {
        refresh()
      }
    }
  }

  struct SnoozeIconButtonView: View {
    let snooze: Snooze
    let action: (_ snooze: Snooze) -> Void

    var body: some View {
      Button(action: {
        action(snooze)
      }) {
        VStack(alignment: .center, spacing: 8) {
          snooze.icon
            .font(.appTitle)
            .foregroundColor(.appYellow48)
          Text(snooze.title)
            .font(.appBody)
            .foregroundColor(.appGrayText)
          Text(snooze.untilStr)
            .font(.appCaption)
            .foregroundColor(.appGrayText)
        }
        .frame(
          maxWidth: .infinity,
          maxHeight: .infinity
        )
      }
      .frame(height: 100)
    }
  }

  struct Snooze {
    let until: Date
    let icon: Image
    let title: String
    let untilStr: String

    init(until: Date, icon: Image, title: String, needsDay: Bool) {
      self.until = until
      self.icon = icon
      self.title = title
      let formatter = DateFormatter()
      formatter.dateFormat = needsDay ? "EEE h:mm a" : "h:mm a"
      self.untilStr = formatter.string(from: until)
    }
  }

  var snoozeValues: [Snooze] {
    let now = Date()
    return Self.snoozeValuesForDate(now: now)
  }

  static func snoozeValuesForDate(now: Date) -> [Snooze] {
    var res: [Snooze] = []
    let calendar = Calendar.current
    let components = calendar.dateComponents([.year, .month, .day, .hour, .timeZone, .weekday], from: now)

    var tonightComponent = components
    tonightComponent.hour = 20

    var thisMorningComponent = components
    thisMorningComponent.hour = 8

    let tonight = calendar.date(from: tonightComponent)!
    let thisMorning = calendar.date(from: thisMorningComponent)!

    let tomorrowMorning = Calendar.current.date(byAdding: DateComponents(day: 1), to: thisMorning)

    // Add either tonight or tomorrow night
    if now < tonight {
      res.append(Snooze(until: tonight, icon: .moonStars, title: "Tonight", needsDay: false))
    } else {
      let tomorrowNight = Calendar.current.date(byAdding: DateComponents(day: 1), to: tonight)!
      res.append(Snooze(until: tomorrowNight, icon: .moonStars, title: "Tomorrow night", needsDay: false))
    }

    if let tomorrowMorning = tomorrowMorning {
      res.append(Snooze(until: tomorrowMorning, icon: .sunHorizon, title: "Tomorrow morning", needsDay: false))
    }

    if let weekday = components.weekday {
      // Add this or next weekend
      if weekday < 5 {
        let thisWeekend = Calendar.current.date(byAdding: DateComponents(day: 7 - weekday), to: thisMorning)
        res.append(Snooze(until: thisWeekend!, icon: .mountains, title: "This weekend", needsDay: true))
      } else {
        let nextWeekend = Calendar.current.date(byAdding: DateComponents(day: 7 - (weekday - 5)), to: thisMorning)!
        res.append(Snooze(until: nextWeekend, icon: .mountains, title: "Next weekend", needsDay: true))
      }
      let nextWeek = Calendar.current.date(byAdding: DateComponents(day: weekday + 5), to: thisMorning)!
      res.append(Snooze(until: nextWeek, icon: .chartLineUp, title: "Next week", needsDay: true))
    }

    return Array(res.sorted(by: { $0.until > $1.until }).reversed())
  }

  func snoozeItem(_ snooze: Snooze) {
    if let item = itemToSnooze {
      withAnimation(.linear(duration: 0.4)) {
        viewModel.performActionSubject.send(.snooze(linkId: item.id, until: snooze.until, successMessage: "Snoozed until \(snooze.untilStr)"))
      }
    }
    itemToSnooze = nil
    snoozePresented = false
  }

  var snoozeView: some View {
    VStack {
      Spacer()

      HStack {
        SnoozeIconButtonView(snooze: snoozeValues[0], action: { snoozeItem($0) })
        SnoozeIconButtonView(snooze: snoozeValues[1], action: { snoozeItem($0) })
      }

      Spacer(minLength: 32)

      HStack {
        SnoozeIconButtonView(snooze: snoozeValues[2], action: { snoozeItem($0) })
        SnoozeIconButtonView(snooze: snoozeValues[3], action: { snoozeItem($0) })
      }
      Spacer()
    }.padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
  }

  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        NavigationView {
          conditionalInnerBody
            .introspectNavigationController {
              navigationController = $0
            }
            .introspectTabBarController {
              tabBarController = $0
              tabBarController?.tabBar.isHidden = false
              navigationController?.navigationBar.isHidden = false
            }
            .onDisappear {
              tabBarController?.tabBar.isHidden = true
              navigationController?.navigationBar.setBackgroundImage(UIImage(), for: .default)
              navigationController?.navigationBar.shadowImage = UIImage()
              navigationController?.navigationBar.isTranslucent = true
            }
            .onAppear {
              tabBarController?.tabBar.isHidden = false
              navigationController?.navigationBar.setBackgroundImage(nil, for: .default)
              navigationController?.navigationBar.shadowImage = nil
              navigationController?.navigationBar.isTranslucent = false
            }
        }
      } else {
        conditionalInnerBody
      }
    #elseif os(macOS)
      conditionalInnerBody
    #endif
  }

  private func refresh() {
    viewModel.performActionSubject.send(.loadItems(query: searchQuery))
  }
}
