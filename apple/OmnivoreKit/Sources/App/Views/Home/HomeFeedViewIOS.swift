import CoreData
import Models
import Services
import SwiftUI
import UserNotifications
import Utils
import Views

// swiftlint:disable file_length
#if os(iOS)
  private let enableGrid = UIDevice.isIPad || FeatureFlag.enableGridCardsOnPhone

  struct HomeFeedContainerView: View {
    @State var hasHighlightMutations = false
    @State var searchPresented = false
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @AppStorage(UserDefaultKey.homeFeedlayoutPreference.rawValue) var prefersListLayout = false
    @ObservedObject var viewModel: HomeFeedViewModel

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, audioController: audioController, isRefresh: isRefresh) }
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
        .sheet(item: $viewModel.itemForHighlightsView) { item in
          HighlightsListView(itemObjectID: item.objectID, hasHighlightMutations: $hasHighlightMutations)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .barLeading) {
            Image.smallOmnivoreLogo
              .renderingMode(.template)
              .resizable()
              .frame(width: 24, height: 24)
              .foregroundColor(.appGrayTextContrast)
          }
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
            Button(
              action: { searchPresented = true },
              label: {
                Image(systemName: "magnifyingglass")
                  .resizable()
                  .frame(width: 18, height: 18)
                  .padding(.vertical)
                  .foregroundColor(.appGrayTextContrast)
              }
            )
          }
          ToolbarItem(placement: .barTrailing) {
            if UIDevice.isIPhone {
              NavigationLink(
                destination: { ProfileView() },
                label: {
                  Image(systemName: "person.circle")
                    .resizable()
                    .frame(width: 22, height: 22)
                    .padding(.vertical, 16)
                    .foregroundColor(.appGrayTextContrast)
                }
              )
            } else {
              EmptyView()
            }
          }
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        loadItems(isRefresh: true)
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushJSONArticle"))) { notification in
        guard let jsonArticle = notification.userInfo?["article"] as? JSONArticle else { return }
        guard let objectID = dataService.persist(jsonArticle: jsonArticle) else { return }
        guard let linkedItem = dataService.viewContext.object(with: objectID) as? LinkedItem else { return }
        viewModel.pushFeedItem(item: linkedItem)
        viewModel.selectedItem = linkedItem
        viewModel.linkIsActive = true
      }
      .onReceive(NSNotification.pushReaderItemPublisher) { notification in
        if let objectID = notification.userInfo?["objectID"] as? NSManagedObjectID {
          viewModel.handleReaderItemNotification(objectID: objectID, dataService: dataService)
        }
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
      .fullScreenCover(isPresented: $searchPresented) {
        LibrarySearchView(homeFeedViewModel: self.viewModel)
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
    @ObservedObject var viewModel: HomeFeedViewModel

    var body: some View {
      VStack(spacing: 0) {
        if prefersListLayout || !enableGrid {
          HomeFeedListView(prefersListLayout: $prefersListLayout, viewModel: viewModel)
        } else {
          HomeFeedGridView(viewModel: viewModel)
        }
      }.sheet(isPresented: $viewModel.showLabelsSheet) {
        FilterByLabelsView(
          initiallySelected: viewModel.selectedLabels,
          initiallyNegated: viewModel.negatedLabels
        ) {
          self.viewModel.selectedLabels = $0
          self.viewModel.negatedLabels = $1
        }
      }
    }
  }

  struct HomeFeedListView: View {
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @Binding var prefersListLayout: Bool

    @State private var itemToRemove: LinkedItem?
    @State private var confirmationShown = false

    @ObservedObject var viewModel: HomeFeedViewModel

    var filtersHeader: some View {
      GeometryReader { reader in
        ScrollView(.horizontal, showsIndicators: false) {
          HStack {
            if viewModel.searchTerm.count > 0 {
              TextChipButton.makeSearchFilterButton(title: viewModel.searchTerm) {
                viewModel.searchTerm = ""
              }.frame(maxWidth: reader.size.width * 0.66)
            } else {
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
            }
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
              viewModel.showLabelsSheet = true
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
          .padding(0)
        }
        .listRowSeparator(.hidden)
      }
    }

    func menuItems(for item: LinkedItem) -> some View {
      Group {
        if (item.highlights?.count ?? 0) > 0 {
          Button(
            action: { viewModel.itemForHighlightsView = item },
            label: { Label("View Highlights & Notes", systemImage: "highlighter") }
          )
        }
        Button(
          action: { viewModel.itemUnderTitleEdit = item },
          label: { Label("Edit Title/Description", systemImage: "textbox") }
        )
        Button(
          action: { viewModel.itemUnderLabelEdit = item },
          label: { Label(item.labels?.count == 0 ? "Add Labels" : "Edit Labels", systemImage: "tag") }
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
          label: {
            Label("Remove Item", systemImage: "trash")
          }
        ).tint(.red)
        if FeatureFlag.enableSnooze {
          Button {
            viewModel.itemToSnoozeID = item.id
            viewModel.snoozePresented = true
          } label: {
            Label { Text("Snooze") } icon: { Image.moon }
          }
        }
        if let author = item.author {
          Button(
            action: {
              viewModel.searchTerm = "author:\"\(author)\""
            },
            label: {
              Label(String("More by \(author)"), systemImage: "person")
            }
          )
        }
      }
    }

    var body: some View {
      ZStack {
        NavigationLink(
          destination: LinkDestination(selectedItem: viewModel.selectedItem),
          isActive: $viewModel.linkIsActive
        ) {
          EmptyView()
        }
        VStack(spacing: 0) {
          if viewModel.showLoadingBar {
            ShimmeringLoader()
          } else {
            Spacer(minLength: 2)
          }

          List {
            if viewModel.items.count > 0 || viewModel.searchTerm.count > 0 {
              filtersHeader
            }
            ForEach(viewModel.items) { item in
              FeedCardNavigationLink(
                item: item,
                viewModel: viewModel
              )
              .contextMenu {
                menuItems(for: item)
              }
              .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                if !item.isArchived {
                  Button(action: {
                    withAnimation(.linear(duration: 0.4)) {
                      viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: true)
                    }
                  }, label: {
                    Label("Archive", systemImage: "archivebox")
                  }).tint(.green)
                } else {
                  Button(action: {
                    withAnimation(.linear(duration: 0.4)) {
                      viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: false)
                    }
                  }, label: {
                    Label("Unarchive", systemImage: "tray.and.arrow.down.fill")
                  }).tint(.indigo)
                }
                Button(
                  action: {
                    itemToRemove = item
                    confirmationShown = true
                  },
                  label: {
                    Image(systemName: "trash")
                  }
                ).tint(.red)
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
          .padding(.top, 0)
          .listStyle(PlainListStyle())
          .alert("Are you sure you want to remove this item? All associated notes and highlights will be deleted.",
                 isPresented: $confirmationShown) {
            Button("Remove Item") {
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
    }
  }

  struct HomeFeedGridView: View {
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @State private var itemToRemove: LinkedItem?
    @State private var confirmationShown = false
    @State var isContextMenuOpen = false

    @ObservedObject var viewModel: HomeFeedViewModel

    func contextMenuActionHandler(item: LinkedItem, action: GridCardAction) {
      switch action {
      case .viewHighlights:
        viewModel.itemForHighlightsView = item
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
      Task { await viewModel.loadItems(dataService: dataService, audioController: audioController, isRefresh: isRefresh) }
    }

    var body: some View {
      ZStack {
        ScrollView {
          NavigationLink(
            destination: LinkDestination(selectedItem: viewModel.selectedItem),
            isActive: $viewModel.linkIsActive
          ) {
            EmptyView()
          }

          LazyVGrid(columns: [GridItem(.adaptive(minimum: 325), spacing: 16)], spacing: 16) {
            ForEach(viewModel.items) { item in
              GridCardNavigationLink(
                item: item,
                actionHandler: { contextMenuActionHandler(item: item, action: $0) },
                isContextMenuOpen: $isContextMenuOpen,
                viewModel: viewModel
              )
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
      .alert("Are you sure you want to remove this item? All associated notes and highlights will be deleted.", isPresented: $confirmationShown) {
        Button("Remove Item", role: .destructive) {
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

struct LinkDestination: View {
  let selectedItem: LinkedItem?

  var body: some View {
    Group {
      if let selectedItem = selectedItem {
        let destination = LinkItemDetailView(
          linkedItemObjectID: selectedItem.objectID,
          isPDF: selectedItem.isPDF
        )
        #if os(iOS)
          let modifiedDestination = destination
            .navigationTitle("")
        #else
          let modifiedDestination = destination
        #endif
        modifiedDestination
      } else {
        EmptyView()
      }
    }
  }
}
