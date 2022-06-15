import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

#if os(iOS)
  private let enableGrid = UIDevice.isIPad || FeatureFlag.enableGridCardsOnPhone

  struct HomeFeedContainerView: View {
    @EnvironmentObject var dataService: DataService
    @AppStorage(UserDefaultKey.homeFeedlayoutPreference.rawValue) var prefersListLayout = false
    @ObservedObject var viewModel: HomeFeedViewModel

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
    }

    var body: some View {
      ZStack {
        if let linkRequest = viewModel.linkRequest {
          NavigationLink(
            destination: WebReaderLoadingContainer(requestID: linkRequest.serverID),
            tag: linkRequest,
            selection: $viewModel.linkRequest
          ) {
            EmptyView()
          }
        }
        HomeFeedView(
          prefersListLayout: $prefersListLayout,
          viewModel: viewModel
        )
        .refreshable {
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.searchTerm) { _ in
          // Maybe we should debounce this, but
          // it feels like it works ok without
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.selectedLabels) { _ in
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.negatedLabels) { _ in
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.appliedFilter) { _ in
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.appliedSort) { _ in
          loadItems(isRefresh: true)
        }
        .sheet(item: $viewModel.itemUnderLabelEdit) { item in
          ApplyLabelsView(mode: .item(item), onSave: nil)
        }
        .sheet(item: $viewModel.itemUnderTitleEdit) { item in
          LinkedItemTitleEditView(item: item)
        }
        .toolbar {
          ToolbarItem(placement: .barTrailing) {
            Button("", action: {})
              .disabled(true)
              .overlay {
                if viewModel.isLoading, !prefersListLayout, enableGrid {
                  ProgressView()
                }
              }
          }
          ToolbarItem(placement: UIDevice.isIPhone ? .barLeading : .barTrailing) {
            if enableGrid {
              Button(
                action: { prefersListLayout.toggle() },
                label: {
                  Label("Toggle Feed Layout", systemImage: prefersListLayout ? "square.grid.2x2" : "list.bullet")
                }
              )
            } else {
              EmptyView()
            }
          }
          ToolbarItem(placement: .barTrailing) {
            if UIDevice.isIPhone {
              NavigationLink(
                destination: { ProfileView() },
                label: {
                  Image.profile
                    .resizable()
                    .frame(width: 26, height: 26)
                    .padding(.vertical)
                }
              )
            } else {
              EmptyView()
            }
          }
        }
      }
      .navigationTitle("Home")
      .navigationBarTitleDisplayMode(.inline)
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        loadItems(isRefresh: true)
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushJSONArticle"))) { notification in
        guard let jsonArticle = notification.userInfo?["article"] as? JSONArticle else { return }
        guard let objectID = dataService.persist(jsonArticle: jsonArticle) else { return }
        guard let linkedItem = dataService.viewContext.object(with: objectID) as? LinkedItem else { return }
        viewModel.pushFeedItem(item: linkedItem)
        viewModel.selectedLinkItem = linkedItem.objectID
      }
      .onOpenURL { url in
        withoutAnimation {
          viewModel.linkRequest = nil
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
            if let linkRequestID = DeepLink.make(from: url)?.linkRequestID {
              viewModel.linkRequest = LinkRequest(id: UUID(), serverID: linkRequestID)
            }
          }
        }
      }
      .formSheet(isPresented: $viewModel.snoozePresented) {
        SnoozeView(
          snoozePresented: $viewModel.snoozePresented,
          itemToSnoozeID: $viewModel.itemToSnoozeID
        ) { snoozeParams in
          Task {
            await viewModel.snoozeUntil(
              dataService: dataService,
              linkId: snoozeParams.feedItemId,
              until: snoozeParams.snoozeUntilDate,
              successMessage: snoozeParams.successMessage
            )
          }
        }
      }
      .task {
        if viewModel.items.isEmpty {
          loadItems(isRefresh: true)
        }
      }
    }
  }

  struct HomeFeedView: View {
    @EnvironmentObject var dataService: DataService
    @Binding var prefersListLayout: Bool
    @State private var showLabelsSheet = false
    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      VStack(spacing: 0) {
        SearchBar(searchTerm: $viewModel.searchTerm)

        ZStack(alignment: .bottom) {
          ScrollView(.horizontal, showsIndicators: false) {
            HStack {
              Menu(
                content: {
                  ForEach(LinkedItemFilter.allCases, id: \.self) { filter in
                    Button(filter.displayName, action: { viewModel.appliedFilter = filter.rawValue })
                  }
                },
                label: {
                  TextChipButton.makeMenuButton(
                    title: LinkedItemFilter(rawValue: viewModel.appliedFilter)?.displayName ?? "Filter"
                  )
                }
              )
              Menu(
                content: {
                  ForEach(LinkedItemSort.allCases, id: \.self) { sort in
                    Button(sort.displayName, action: { viewModel.appliedSort = sort.rawValue })
                  }
                },
                label: {
                  TextChipButton.makeMenuButton(
                    title: LinkedItemSort(rawValue: viewModel.appliedSort)?.displayName ?? "Sort"
                  )
                }
              )
              TextChipButton.makeAddLabelButton {
                showLabelsSheet = true
              }
              ForEach(viewModel.selectedLabels, id: \.self) { label in
                TextChipButton.makeRemovableLabelButton(feedItemLabel: label, negated: false) {
                  viewModel.selectedLabels.removeAll { $0.id == label.id }
                }
              }
              ForEach(viewModel.negatedLabels, id: \.self) { label in
                TextChipButton.makeRemovableLabelButton(feedItemLabel: label, negated: true) {
                  viewModel.negatedLabels.removeAll { $0.id == label.id }
                }
              }
              Spacer()
            }
            .padding(.horizontal)
            .sheet(isPresented: $showLabelsSheet) {
              FilterByLabelsView(initiallySelected: viewModel.selectedLabels, initiallyNegated: viewModel.negatedLabels) {
                self.viewModel.selectedLabels = $0
                self.viewModel.negatedLabels = $1
              }
            }
          }
          if viewModel.showLoadingBar {
            ShimmeringLoader()
          }
        }
        if prefersListLayout || !enableGrid {
          HomeFeedListView(prefersListLayout: $prefersListLayout, viewModel: viewModel)
        } else {
          HomeFeedGridView(viewModel: viewModel)
        }
      }
    }
  }

  struct HomeFeedListView: View {
    @EnvironmentObject var dataService: DataService
    @Binding var prefersListLayout: Bool

    @State private var itemToRemove: LinkedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      List {
        Section {
          ForEach(viewModel.items) { item in
            FeedCardNavigationLink(
              item: item,
              viewModel: viewModel
            )
            .contextMenu {
              Button(
                action: { viewModel.itemUnderTitleEdit = item },
                label: { Label("Edit Title/Description", systemImage: "textbox") }
              )
              Button(
                action: { viewModel.itemUnderLabelEdit = item },
                label: { Label("Edit Labels", systemImage: "tag") }
              )
              Button(action: {
                withAnimation(.linear(duration: 0.4)) {
                  viewModel.setLinkArchived(
                    dataService: dataService,
                    objectID: item.objectID,
                    archived: !item.isArchived
                  )
                }
              }, label: {
                Label(
                  item.isArchived ? "Unarchive" : "Archive",
                  systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
                )
              })
              Button(
                action: {
                  itemToRemove = item
                  confirmationShown = true
                },
                label: { Label("Delete", systemImage: "trash") }
              )
              if FeatureFlag.enableSnooze {
                Button {
                  viewModel.itemToSnoozeID = item.id
                  viewModel.snoozePresented = true
                } label: {
                  Label { Text("Snooze") } icon: { Image.moon }
                }
              }
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
              if !item.isArchived {
                Button {
                  withAnimation(.linear(duration: 0.4)) {
                    viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: true)
                  }
                } label: {
                  Label("Archive", systemImage: "archivebox")
                }.tint(.green)
              } else {
                Button {
                  withAnimation(.linear(duration: 0.4)) {
                    viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: false)
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
                    viewModel.removeLink(dataService: dataService, objectID: itemToRemove.objectID)
                  }
                }
                self.itemToRemove = nil
              }
              Button("Cancel", role: .cancel) { self.itemToRemove = nil }
            }
            .swipeActions(edge: .leading, allowsFullSwipe: true) {
              if FeatureFlag.enableSnooze {
                Button {
                  viewModel.itemToSnoozeID = item.id
                  viewModel.snoozePresented = true
                } label: {
                  Label { Text("Snooze") } icon: { Image.moon }
                }.tint(.appYellow48)
              }
            }
          }
        }

        if viewModel.isLoading {
          LoadingSection()
        }
      }
      .listStyle(PlainListStyle())
    }
  }

  struct HomeFeedGridView: View {
    @EnvironmentObject var dataService: DataService

    @State private var itemToRemove: LinkedItem?
    @State private var confirmationShown = false
    @State var isContextMenuOpen = false

    @ObservedObject var viewModel: HomeFeedViewModel

    func contextMenuActionHandler(item: LinkedItem, action: GridCardAction) {
      switch action {
      case .toggleArchiveStatus:
        viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: !item.isArchived)
      case .delete:
        itemToRemove = item
        confirmationShown = true
      case .editLabels:
        viewModel.itemUnderLabelEdit = item
      case .editTitle:
        viewModel.itemUnderTitleEdit = item
      }
    }

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
    }

    var body: some View {
      ScrollView {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 325), spacing: 16)], spacing: 16) {
          ForEach(viewModel.items) { item in
            GridCardNavigationLink(
              item: item,
              actionHandler: { contextMenuActionHandler(item: item, action: $0) },
              isContextMenuOpen: $isContextMenuOpen,
              viewModel: viewModel
            )
            .alert("Are you sure?", isPresented: $confirmationShown) {
              Button("Remove Link", role: .destructive) {
                if let itemToRemove = itemToRemove {
                  withAnimation {
                    viewModel.removeLink(dataService: dataService, objectID: itemToRemove.objectID)
                  }
                }
                self.itemToRemove = nil
              }
              Button("Cancel", role: .cancel) { self.itemToRemove = nil }
            }
          }
        }
        .padding()
        .background(
          GeometryReader {
            Color(.systemGroupedBackground).preference(
              key: ScrollViewOffsetPreferenceKey.self,
              value: $0.frame(in: .global).origin.y
            )
          }
        )
        .onPreferenceChange(ScrollViewOffsetPreferenceKey.self) { offset in
          DispatchQueue.main.async {
            if !viewModel.isLoading, offset > 240 {
              loadItems(isRefresh: true)
            }
          }
        }

        if viewModel.items.isEmpty, viewModel.isLoading {
          LoadingSection()
        }
      }
    }
  }

#endif

struct ScrollViewOffsetPreferenceKey: PreferenceKey {
  typealias Value = CGFloat
  static var defaultValue = CGFloat.zero
  static func reduce(value: inout Value, nextValue: () -> Value) {
    value += nextValue()
  }
}

#if os(iOS)
  // Allows us to present a sheet without animation
  // Used to configure full screen modal view coming from share extension read now button action
  private extension View {
    func withoutAnimation(_ completion: @escaping () -> Void) {
      UIView.setAnimationsEnabled(false)
      completion()
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200)) {
        UIView.setAnimationsEnabled(true)
      }
    }
  }
#endif
