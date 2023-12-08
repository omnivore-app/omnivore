import CoreData
import Models
import Services
import SwiftUI
import Transmission
import UserNotifications
import Utils
import Views

struct AnimatingCellHeight: AnimatableModifier {
  var height: CGFloat = 0

  var animatableData: CGFloat {
    get { height }
    set { height = newValue }
  }

  func body(content: Content) -> some View {
    content.frame(height: height, alignment: .top).clipped()
  }
}

// swiftlint:disable file_length
#if os(iOS)
  private let enableGrid = UIDevice.isIPad || FeatureFlag.enableGridCardsOnPhone

  @MainActor
  struct HomeFeedContainerView: View {
    @State var hasHighlightMutations = false
    @State var searchPresented = false
    @State var addLinkPresented = false
    @State var isListScrolled = false
    @State var listTitle = ""
    @State var isEditMode: EditMode = .inactive
    @State var showOpenAIVoices = false
    @State var showExpandedAudioPlayer = false

    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @AppStorage(UserDefaultKey.homeFeedlayoutPreference.rawValue) var prefersListLayout = true
    @AppStorage(UserDefaultKey.openAIPrimerDisplayed.rawValue) var openAIPrimerDisplayed = false

    @ObservedObject var viewModel: HomeFeedViewModel
    @State private var selection = Set<String>()

    init(viewModel: HomeFeedViewModel) {
      _viewModel = ObservedObject(wrappedValue: viewModel)
    }

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
    }

    var showFeatureCards: Bool {
      viewModel.listConfig.hasFeatureCards &&
        !viewModel.hideFeatureSection &&
        viewModel.fetcher.items.count > 0 &&
        viewModel.searchTerm.isEmpty &&
        viewModel.selectedLabels.isEmpty &&
        viewModel.negatedLabels.isEmpty &&
        viewModel.appliedFilter?.name.lowercased() == "inbox"
    }

    var body: some View {
      ZStack {
        HomeFeedView(
          listTitle: $listTitle,
          isListScrolled: $isListScrolled,
          prefersListLayout: $prefersListLayout,
          isEditMode: $isEditMode,
          selection: $selection,
          viewModel: viewModel,
          showFeatureCards: showFeatureCards
        )
        .refreshable {
          loadItems(isRefresh: true)
        }
        .onChange(of: viewModel.presentWebContainer) { _ in
          if !viewModel.presentWebContainer {
            viewModel.linkRequest = nil
          }
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

        if UIDevice.isIPad {
          VStack(spacing: 0) {
            Spacer()

            if let audioProperties = audioController.itemAudioProperties {
              MiniPlayerViewer(itemAudioProperties: audioProperties)
                .padding(.top, 10)
                .padding(.bottom, 20)
                .background(Color.themeTabBarColor)
                .onTapGesture {
                  showExpandedAudioPlayer = true
                }
            }
          }
        }
      }
      .sheet(item: $viewModel.itemUnderLabelEdit) { item in
        ApplyLabelsView(mode: .item(item), onSave: nil)
      }
      .sheet(item: $viewModel.itemUnderTitleEdit) { item in
        LinkedItemMetadataEditView(item: item)
      }
      .sheet(item: $viewModel.itemForHighlightsView) { item in
        NotebookView(itemObjectID: item.objectID, hasHighlightMutations: $hasHighlightMutations)
      }
      .fullScreenCover(isPresented: $showExpandedAudioPlayer) {
        ExpandedAudioPlayer()
      }
      .sheet(isPresented: $showOpenAIVoices) {
        OpenAIVoicesModal(audioController: audioController)
      }
      .onAppear {
        if !openAIPrimerDisplayed, !Voices.isOpenAIVoice(self.audioController.currentVoice) {
          showOpenAIVoices = true
          openAIPrimerDisplayed = true
        }
      }
      .toolbar {
        toolbarItems
      }
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        loadItems(isRefresh: false)
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushJSONArticle"))) { notification in
        guard let jsonArticle = notification.userInfo?["article"] as? JSONArticle else { return }
        guard let objectID = dataService.persist(jsonArticle: jsonArticle) else { return }
        guard let linkedItem = dataService.viewContext.object(with: objectID) as? Models.LibraryItem else { return }
        viewModel.pushFeedItem(item: linkedItem)
        viewModel.selectedItem = linkedItem
        viewModel.linkIsActive = true
      }
      .onOpenURL { url in
        viewModel.linkRequest = nil
        if let deepLink = DeepLink.make(from: url) {
          switch deepLink {
          case let .search(query):
            viewModel.searchTerm = query
          case let .savedSearch(named):
            if let filter = viewModel.findFilter(dataService, named: named) {
              viewModel.appliedFilter = filter
            }
          case let .webAppLinkRequest(requestID):
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              withoutAnimation {
                viewModel.linkRequest = LinkRequest(id: UUID(), serverID: requestID)
                viewModel.presentWebContainer = true
              }
            }
          }
        }
      }
      .fullScreenCover(isPresented: $searchPresented) {
        LibrarySearchView(homeFeedViewModel: self.viewModel)
      }
      .sheet(isPresented: $addLinkPresented) {
        NavigationView {
          LibraryAddLinkView()
        }
      }
      .task {
        if viewModel.fetcher.items.isEmpty {
          loadItems(isRefresh: false)
        }
        await viewModel.loadFilters(dataService: dataService)
      }
      .environment(\.editMode, self.$isEditMode)
    }

    var toolbarItems: some ToolbarContent {
      Group {
        ToolbarItem(placement: .barLeading) {
          VStack(alignment: .leading) {
            let showDate = isListScrolled && !listTitle.isEmpty
            if let title = viewModel.appliedFilter?.name {
              Text(title)
                .font(Font.system(size: showDate ? 10 : 24, weight: .semibold))
              if showDate, prefersListLayout, isListScrolled || !showFeatureCards {
                Text(listTitle)
                  .font(Font.system(size: 15, weight: .regular))
                  .foregroundColor(Color.appGrayText)
              }
            }
          }
          .frame(maxWidth: .infinity, alignment: .bottomLeading)
        }

        ToolbarItem(placement: .barTrailing) {
          if UIDevice.isIPad, viewModel.folder == "inbox" {
            Button(action: { addLinkPresented = true }, label: {
              Label("Add Link", systemImage: "plus")
            })
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
          }
        }
        ToolbarItem(placement: .barTrailing) {
          Button(
            action: { searchPresented = true },
            label: {
              Image(systemName: "magnifyingglass")
                .foregroundColor(Color.appGrayTextContrast)
            }
          )
        }
        ToolbarItem(placement: .barTrailing) {
          if UIDevice.isIPhone {
            Menu(content: {
              Button(action: {
                isEditMode = isEditMode == .inactive ? .active : .inactive
              }, label: {
                Text(isEditMode == .inactive ? "Select Multiple" : "End Multiselect")
              })
              Button(action: { addLinkPresented = true }, label: {
                Label("Add Link", systemImage: "plus.circle")
              })
            }, label: {
              Image.utilityMenu
            })
              .foregroundColor(.appGrayTextContrast)
          }
        }
        ToolbarItemGroup(placement: .bottomBar) {
          if isEditMode == .active {
            Button(action: {
              viewModel.bulkAction(dataService: dataService, action: .archive, items: Array(selection))
              isEditMode = .inactive
            }, label: { Image(systemName: "archivebox") })
            Button(action: {
              viewModel.bulkAction(dataService: dataService, action: .delete, items: Array(selection))
              isEditMode = .inactive
            }, label: { Image(systemName: "trash") })
            Spacer()
            Text("\(selection.count) selected").font(.footnote)
            Spacer()
            Button(action: { isEditMode = .inactive }, label: { Text("Cancel") })
          }
        }
      }
    }
  }

  @MainActor
  struct HomeFeedView: View {
    @EnvironmentObject var dataService: DataService

    @Binding var listTitle: String
    @Binding var isListScrolled: Bool
    @Binding var prefersListLayout: Bool
    @Binding var isEditMode: EditMode
    @Binding var selection: Set<String>
    @ObservedObject var viewModel: HomeFeedViewModel

    let showFeatureCards: Bool

    var body: some View {
      VStack(spacing: 0) {
        if let linkRequest = viewModel.linkRequest {
          PresentationLink(
            transition: PresentationLinkTransition.slide(
              options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                         options:
                                                                         PresentationLinkTransition.Options(
                                                                           modalPresentationCapturesStatusBarAppearance: true
                                                                         ))),
            isPresented: $viewModel.presentWebContainer,
            destination: {
              WebReaderLoadingContainer(requestID: linkRequest.serverID)
                .background(ThemeManager.currentBgColor)
            }, label: {
              EmptyView()
            }
          )
        }
        if prefersListLayout || !enableGrid {
          HomeFeedListView(
            listTitle: $listTitle,
            isListScrolled: $isListScrolled,
            prefersListLayout: $prefersListLayout,
            isEditMode: $isEditMode,
            selection: $selection,
            viewModel: viewModel,
            showFeatureCards: showFeatureCards
          )
        } else {
          HomeFeedGridView(
            viewModel: viewModel,
            isListScrolled: $isListScrolled
          )
        }
      }.sheet(isPresented: $viewModel.showLabelsSheet) {
        FilterByLabelsView(
          initiallySelected: viewModel.selectedLabels,
          initiallyNegated: viewModel.negatedLabels
        ) {
          viewModel.selectedLabels = $0
          viewModel.negatedLabels = $1
        }
      }
      .popup(isPresented: $viewModel.showSnackbar) {
        if let operation = viewModel.snackbarOperation {
          Snackbar(isShowing: $viewModel.showSnackbar, operation: operation)
        } else {
          EmptyView()
        }
      } customize: {
        $0
          .type(.toast)
          .autohideIn(2)
          .position(.bottom)
          .animation(.spring())
          .isOpaque(false)
      }
      .onReceive(NSNotification.librarySnackBarPublisher) { notification in
        if !viewModel.showSnackbar {
          if let message = notification.userInfo?["message"] as? String {
            viewModel.snackbarOperation = SnackbarOperation(message: message,
                                                            undoAction: notification.userInfo?["undoAction"] as? SnackbarUndoAction)
            viewModel.showSnackbar = true
          }
        }
      }
    }
  }

  struct HomeFeedListView: View {
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @Binding var listTitle: String
    @Binding var isListScrolled: Bool
    @Binding var prefersListLayout: Bool
    @Binding var isEditMode: EditMode
    @State private var showHideFeatureAlert = false

    @Binding var selection: Set<String>
    @ObservedObject var viewModel: HomeFeedViewModel

    let showFeatureCards: Bool

    @State var shouldScrollToTop = false
    @State var topItem: Models.LibraryItem?
    @ObservedObject var networkMonitor = NetworkMonitor()

//    init(listTitle: Binding<String>,
//         isListScrolled: Binding<Bool>,
//         prefersListLayout: Binding<Bool>,
//         isEditMode: Binding<EditMode>,
//         selection: Binding<Set<String>>,
//         viewModel: HomeFeedViewModel,
//         showFeatureCards: Bool)
//    {
//      self._listTitle = listTitle
//      self._isListScrolled = isListScrolled
//      self._prefersListLayout = prefersListLayout
//      self._isEditMode = isEditMode
//      self._selection = selection
//      self.viewModel = viewModel
//      self.showFeatureCards = showFeatureCards
//    }

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
                  ForEach(viewModel.filters) { filter in
                    Button(filter.name, action: {
                      viewModel.appliedFilter = filter
                    })
                  }
                },
                label: {
                  TextChipButton.makeMenuButton(
                    title: viewModel.appliedFilter?.name ?? "-",
                    color: .systemGray6
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
                  title: LinkedItemSort(rawValue: viewModel.appliedSort)?.displayName ?? "Sort",
                  color: .systemGray6
                )
              }
            )
            TextChipButton.makeAddLabelButton(color: .systemGray6, onTap: { viewModel.showLabelsSheet = true })
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
        }
      }
      .padding(.top, 0)
      .padding(.bottom, 10)
      .padding(.leading, 15)
      .listRowSpacing(0)
      .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
      .frame(maxWidth: .infinity, minHeight: 38)
      .background(Color.systemBackground)
      .overlay(Rectangle()
        .padding(.leading, 15)
        .frame(width: nil, height: 0.5, alignment: .bottom)
        .foregroundColor(isListScrolled ? Color(hex: "#3D3D3D") : Color.systemBackground), alignment: .bottom)
      .dynamicTypeSize(.small ... .accessibility1)
    }

    func menuItems(for item: Models.LibraryItem) -> some View {
      libraryItemMenu(dataService: dataService, viewModel: viewModel, item: item)
    }

    var featureCard: some View {
      VStack(spacing: 0) {
        if Color.isDarkMode {
          Color(hex: "#3D3D3D").frame(maxWidth: .infinity, maxHeight: 0.5)
        }
        VStack(alignment: .leading, spacing: 15) {
          HStack {
            Menu(content: {
              Button(action: {
                viewModel.updateFeatureFilter(context: dataService.viewContext, filter: .continueReading)
              }, label: {
                Text("Continue Reading")
              })
              Button(action: {
                viewModel.updateFeatureFilter(context: dataService.viewContext, filter: .pinned)
              }, label: {
                Text("Pinned")
              })
              Button(action: {
                viewModel.updateFeatureFilter(context: dataService.viewContext, filter: .newsletters)
              }, label: {
                Text("Newsletters")
              })
              Button(action: {
                showHideFeatureAlert = true
              }, label: {
                Text("Hide this Section")
              })
            }, label: {
              Group {
                HStack(alignment: .center) {
                  Image(systemName: "line.3.horizontal.decrease")
                    .font(Font.system(size: 13, weight: .regular))
                  Text((FeaturedItemFilter(rawValue: viewModel.featureFilter) ?? .continueReading).title)
                    .font(Font.system(size: 13, weight: .medium))
                }
                .tint(Color(hex: "#007AFF"))
                .padding(.vertical, 5)
                .padding(.horizontal, 7)
                .background(Color(hex: "#007AFF")?.opacity(0.1))
                .cornerRadius(5)
              }.frame(maxWidth: .infinity, alignment: .leading)
            })
            Spacer()
          }
          .padding(.top, 10)
          .padding(.horizontal, 15)

          GeometryReader { geo in
            ScrollView(.horizontal, showsIndicators: false) {
              if viewModel.featureItems.count > 0 {
                HStack(alignment: .top, spacing: 15) {
                  Spacer(minLength: 1).frame(width: 1)
                  ForEach(viewModel.featureItems) { item in
                    LibraryFeatureCardNavigationLink(item: item, viewModel: viewModel)
                  }
                  Spacer(minLength: 1).frame(width: 1)
                }
                .padding(.top, 0)
              } else {
                Text((FeaturedItemFilter(rawValue: viewModel.featureFilter) ?? .continueReading).emptyMessage)
                  .padding(.horizontal, UIDevice.isIPad ? 20 : 10)
                  .font(Font.system(size: 14, weight: .regular))
                  .foregroundColor(Color(hex: "#898989"))
                  .frame(maxWidth: geo.size.width)
                  .frame(height: 60, alignment: .topLeading)
                  .fixedSize(horizontal: false, vertical: true)
              }
            }
          }
        }
        .background(Color.themeFeatureBackground)
        .frame(height: 190)

        if !Color.isDarkMode {
          VStack {
            LinearGradient(gradient: Gradient(colors: [.black.opacity(0.06), .systemGray6]),
                           startPoint: .top, endPoint: .bottom)
              .frame(maxWidth: .infinity, maxHeight: 3)
              .opacity(0.4)

            Spacer()
          }
          .background(Color.systemGray6)
          .frame(maxWidth: .infinity)
        } else {
          VStack {
            Color(hex: "#3D3D3D").frame(maxWidth: .infinity, maxHeight: 0.5)
            Spacer()
          }
          .background(Color.systemBackground)
          .frame(maxWidth: .infinity)
        }
      }
    }

    struct ScrollOffsetPreferenceKey: PreferenceKey {
      static var defaultValue: CGPoint = .zero

      static func reduce(value _: inout CGPoint, nextValue _: () -> CGPoint) {}
    }

    func setTopItem(_ item: Models.LibraryItem) {
      if let date = item.savedAt, let daysAgo = Calendar.current.dateComponents([.day], from: date, to: Date()).day {
        if daysAgo < 1 {
          let formatter = DateFormatter()
          formatter.timeStyle = .none
          formatter.dateStyle = .long
          formatter.doesRelativeDateFormatting = true
          if let str = formatter.string(for: date) {
            listTitle = str.capitalized
          }
        } else if daysAgo < 2 {
          let formatter = RelativeDateTimeFormatter()
          formatter.dateTimeStyle = .named
          if let str = formatter.string(for: date) {
            listTitle = str.capitalized
          }
        } else if daysAgo < 5 {
          let formatter = DateFormatter()
          formatter.dateFormat = "EEEE"
          if let str = formatter.string(for: date) {
            listTitle = str
          }
        } else {
          let formatter = DateFormatter()
          formatter.dateStyle = .medium
          formatter.timeStyle = .none
          if let str = formatter.string(for: date) {
            listTitle = str
          }
        }
        topItem = item
      }
    }

    var body: some View {
      let horizontalInset = CGFloat(UIDevice.isIPad ? 20 : 10)
      VStack(spacing: 0) {
        Color.systemBackground.frame(height: 1)
        ScrollViewReader { reader in
          List(selection: $selection) {
            Section(content: {
              EmptyView().id("TOP")
              if let appliedFilter = viewModel.appliedFilter,
                 networkMonitor.status == .disconnected,
                 !appliedFilter.allowLocalFetch
              {
                HStack {
                  Text("This search requires an internet connection.")
                    .padding()
                    .foregroundColor(Color.white)
                    .frame(maxWidth: .infinity, alignment: .center)
                }
                .background(Color.blue)
                .frame(maxWidth: .infinity, alignment: .center)
                .listRowSeparator(.hidden, edges: .all)
                .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
              } else {
                if showFeatureCards {
                  featureCard
                    .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
                    .listRowSeparator(.hidden, edges: .all)
                    .modifier(AnimatingCellHeight(height: 190 + 13))
                    .onDisappear {
                      withAnimation {
                        isListScrolled = true
                      }
                    }
                    .onAppear {
                      withAnimation {
                        isListScrolled = false
                      }
                    }
                }

                ForEach(Array(viewModel.fetcher.items.enumerated()), id: \.1.unwrappedID) { _, item in
                  FeedCardNavigationLink(
                    item: item,
                    isInMultiSelectMode: viewModel.isInMultiSelectMode,
                    viewModel: viewModel
                  )
                  .background(GeometryReader { geometry in
                    Color.clear
                      .preference(key: ScrollOffsetPreferenceKey.self, value: geometry.frame(in: .named("scroll")).origin)
                  })
                  .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
                    if value.y < 100, value.y > 0 {
                      if item.savedAt != nil, topItem != item {
                        setTopItem(item)
                      }
                    }
                  }
                  .listRowSeparatorTint(Color.thBorderColor)
                  .listRowInsets(.init(top: 0, leading: horizontalInset, bottom: 10, trailing: horizontalInset))
                  .contextMenu {
                    menuItems(for: item)
                  }
                  .swipeActions(edge: .leading, allowsFullSwipe: true) {
                    ForEach(viewModel.listConfig.leadingSwipeActions, id: \.self) { action in
                      swipeActionButton(action: action, item: item)
                    }
                  }
                  .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                    ForEach(viewModel.listConfig.trailingSwipeActions, id: \.self) { action in
                      swipeActionButton(action: action, item: item)
                    }
                  }
                }
              }
            }, header: {
              filtersHeader
            })
          }
          .padding(0)
          .listStyle(.plain)
          .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
          .coordinateSpace(name: "scroll")
          .onChange(of: shouldScrollToTop) { _ in
            if shouldScrollToTop {
              withAnimation {
                reader.scrollTo("TOP", anchor: .top)
              }
            }
            shouldScrollToTop = false
          }
        }
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
          shouldScrollToTop = true
        }
      }
      .alert("The Feature Section will be removed from your library. You can add it back from the filter settings in your profile.",
             isPresented: $showHideFeatureAlert) {
        Button("OK", role: .destructive) {
          viewModel.hideFeatureSection = true
        }
        Button(LocalText.cancelGeneric, role: .cancel) { self.showHideFeatureAlert = false }
      }.introspectNavigationController { nav in
        nav.navigationBar.shadowImage = UIImage()
        nav.navigationBar.setBackgroundImage(UIImage(), for: .default)
      }
    }

    func swipeActionButton(action: SwipeAction, item: Models.LibraryItem) -> AnyView {
      switch action {
      case .pin:
        let isPinned = item.labels?.allObjects.first { ($0 as? LinkedItemLabel)?.name == "Pinned" } != nil
        return AnyView(Button(action: {
          if isPinned {
            viewModel.unpinItem(dataService: dataService, item: item)
          } else {
            viewModel.pinItem(dataService: dataService, item: item)
          }
        }, label: {
          VStack {
            Image.pinRotated
            Text(isPinned ? "Unpin" : "Pin")
          }
        }).tint(Color(hex: "#0A84FF")))
      case .archive:
        return AnyView(Button(action: {
          withAnimation(.linear(duration: 0.4)) {
            viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: !item.isArchived)
          }
        }, label: {
          Label(!item.isArchived ? "Archive" : "Unarchive",
                systemImage: !item.isArchived ? "archivebox" : "tray.and.arrow.down.fill")
        })
          .tint(!item.isArchived ? .green : .indigo))
      case .delete:
        return AnyView(Button(
          action: {
            viewModel.removeLibraryItem(dataService: dataService, objectID: item.objectID)
          },
          label: {
            Label("Remove", systemImage: "trash")
          }
        ).tint(.red))
      case .moveToInbox:
        return AnyView(Button(
          action: {
            viewModel.moveToFolder(dataService: dataService, item: item, folder: "inbox")
          },
          label: {
            Label(title: { Text("Move to Library") },
                  icon: { Image.tabLibrary })
          }
        ).tint(Color(hex: "#0A84FF")))
      }
    }
  }

  struct HomeFeedGridView: View {
    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController

    @State var isContextMenuOpen = false

    @ObservedObject var viewModel: HomeFeedViewModel

    @Binding var isListScrolled: Bool

    func contextMenuActionHandler(item: Models.LibraryItem, action: GridCardAction) {
      switch action {
      case .viewHighlights:
        viewModel.itemForHighlightsView = item
      case .toggleArchiveStatus:
        viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: !item.isArchived)
      case .delete:
        viewModel.removeLibraryItem(dataService: dataService, objectID: item.objectID)
      case .editLabels:
        viewModel.itemUnderLabelEdit = item
      case .editTitle:
        viewModel.itemUnderTitleEdit = item
      }
    }

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
    }

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
                  ForEach(viewModel.filters, id: \.self) { filter in
                    Button(filter.name, action: { viewModel.appliedFilter = filter })
                  }
                },
                label: {
                  TextChipButton.makeMenuButton(
                    title: viewModel.appliedFilter?.name ?? "-",
                    color: .systemGray6
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
                  title: LinkedItemSort(rawValue: viewModel.appliedSort)?.displayName ?? "Sort",
                  color: .systemGray6
                )
              }
            )
            TextChipButton.makeAddLabelButton(color: .systemGray6, onTap: { viewModel.showLabelsSheet = true })
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
      .dynamicTypeSize(.small ... .accessibility1)
    }

    var body: some View {
      VStack(alignment: .leading) {
        Color.systemBackground.frame(height: 1)
        filtersHeader
          .onAppear {
            withAnimation {
              isListScrolled = false
            }
          }
          .onDisappear {
            withAnimation {
              isListScrolled = true
            }
          }
          .padding(.horizontal, 20)
          .frame(maxHeight: 35)

        ScrollView {
          LazyVGrid(columns: [GridItem(.adaptive(minimum: 325, maximum: 400), spacing: 16)], alignment: .center, spacing: 30) {
            ForEach(viewModel.fetcher.items) { item in
              GridCardNavigationLink(
                item: item,
                actionHandler: { contextMenuActionHandler(item: item, action: $0) },
                isContextMenuOpen: $isContextMenuOpen,
                viewModel: viewModel
              )
            }
            Spacer()
          }
          .frame(maxHeight: .infinity)
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

          if viewModel.fetcher.items.isEmpty, viewModel.isLoading {
            LoadingSection()
          }
        }
        .background(Color(.systemGroupedBackground))

        Spacer()
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
  let selectedItem: Models.LibraryItem?

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
