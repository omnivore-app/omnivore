// swiftlint:disable file_length type_body_length
import CoreData
import Models
import Services
import SwiftUI
import Transmission
import UserNotifications
import Utils
import Views

struct FiltersHeader: View {
  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    GeometryReader { reader in
      ScrollView(.horizontal, showsIndicators: false) {
        HStack {
          if viewModel.searchTerm.count > 0 {
            TextChipButton.makeSearchFilterButton(title: viewModel.searchTerm) {
              viewModel.searchTerm = ""
            }.frame(maxWidth: reader.size.width * 0.66)
          } else {
            let hideFollowingTab = UserDefaults.standard.bool(forKey: "LibraryTabView::hideFollowingTab")
            Menu(
              content: {
                ForEach(viewModel.filters.filter { hideFollowingTab || $0.folder == viewModel.currentFolder }) { filter in
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
            ).buttonStyle(.plain)
            // }
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
          ).buttonStyle(.plain)

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
    .dynamicTypeSize(.small ... .accessibility1)
  }
}

struct EmptyState: View {
  @ObservedObject var viewModel: HomeFeedViewModel
  @EnvironmentObject var dataService: DataService

  @State var showSendNewslettersAlert = false

  var followingEmptyState: some View {
    VStack(alignment: .center, spacing: 20) {
      if viewModel.stopUsingFollowingPrimer {
        VStack(spacing: 10) {
          Image.relaxedSlothLight
          Text("You are all caught up.").foregroundColor(Color.extensionTextSubtle)
          Button(action: {
            Task {
              await viewModel.loadItems(dataService: dataService, isRefresh: true, loadingBarStyle: .simple)
            }
          }, label: { Text("Refresh").bold() })
            .foregroundColor(Color.blue)
        }
      } else {
        Text("You don't have any Feed items.")
          .font(Font.system(size: 18, weight: .bold))

        Text("Add an RSS/Atom feed")
          .foregroundColor(Color.blue)
          .onTapGesture {
            viewModel.showAddFeedView = true
          }

        Text("Send your newsletters to following")
          .foregroundColor(Color.blue)
          .onTapGesture {
            showSendNewslettersAlert = true
          }

        Text("Hide the Following tab")
          .foregroundColor(Color.blue)
          .onTapGesture {
            viewModel.showHideFollowingAlert = true
          }
      }
    }

    .frame(minHeight: 400)
    .frame(maxWidth: .infinity)
    .padding()
    .alert("Update newsletter destination", isPresented: $showSendNewslettersAlert, actions: {
      Button(action: {
        Task {
          await viewModel.modifyingNewsletterDestinationToFollowing(dataService: dataService)
        }
      }, label: { Text("OK") })
      Button(LocalText.cancelGeneric, role: .cancel) { showSendNewslettersAlert = false }
    }, message: {
      // swiftlint:disable:next line_length
      Text("Your email address destination folders will be modified to send to this tab.\n\nAll new newsletters will appear here. You can modify the destination for each individual email address and subscription in your settings.")
    })
  }

  var body: some View {
    if viewModel.isModifyingNewsletterDestination {
      return AnyView(
        VStack {
          Text("Modifying newsletter destinations...")
          ProgressView()
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
      )
    } else if viewModel.currentFolder == "following" {
      return AnyView(followingEmptyState)
    } else {
      return AnyView(Group {
        Spacer()

        if viewModel.showLoadingBar == .none {
          VStack(alignment: .center, spacing: 20) {
            Text("No results found for this query")
              .font(Font.system(size: 18, weight: .bold))
          }
          .frame(minHeight: 400)
          .frame(maxWidth: .infinity)
          .padding()
        }

        Spacer()
      })
    }
  }
}

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
  private let enableGrid = UIDevice.isIPad

  @MainActor
  struct HomeFeedContainerView: View {
    @State var hasHighlightMutations = false
    @State var searchPresented = false
    @State var showAddLinkView = false
    @State var isListScrolled = false
    @State var listTitle = ""
    @State var showExpandedAudioPlayer = false
    @State var showLibraryDigest = false
    @State var showDigestConfig = false

    @Binding var isEditMode: EditMode

    @EnvironmentObject var dataService: DataService
    @EnvironmentObject var audioController: AudioController
    @Environment(\.horizontalSizeClass) var horizontalSizeClass

    @AppStorage(UserDefaultKey.homeFeedlayoutPreference.rawValue) var prefersListLayout = true

    @ObservedObject var viewModel: HomeFeedViewModel
    @State private var selection = Set<String>()

    init(viewModel: HomeFeedViewModel, isEditMode: Binding<EditMode>) {
      _viewModel = ObservedObject(wrappedValue: viewModel)
      _isEditMode = isEditMode
    }

    func loadItems(isRefresh: Bool) {
      Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
    }

    var showFeatureCards: Bool {
      isEditMode == .inactive &&
        (viewModel.currentListConfig?.hasFeatureCards ?? false) &&
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

            if audioController.itemAudioProperties != nil {
              MiniPlayerViewer()
                .padding(.top, 10)
                .padding(.bottom, 20)
                .background(Color.themeTabBarColor)
                .onTapGesture {
                  if audioController.itemAudioProperties?.audioItemType == .digest {
                    showLibraryDigest = true
                  } else {
                    showExpandedAudioPlayer = true
                  }
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
        NotebookView(viewModel: NotebookViewModel(item: item), hasHighlightMutations: $hasHighlightMutations)
      }
      .sheet(isPresented: $viewModel.showAddFeedView) {
        NavigationView {
          LibraryAddFeedView(dismiss: {
            viewModel.showAddFeedView = false
          }, toastOperationHandler: nil)
        }
      }
      .sheet(isPresented: $showAddLinkView) {
        NavigationView {
          LibraryAddLinkView()
        }
      }
      .sheet(isPresented: $showExpandedAudioPlayer) {
        ExpandedAudioPlayer(
          delete: {
            showExpandedAudioPlayer = false
            audioController.stop()
            viewModel.removeLibraryItem(dataService: dataService, objectID: $0)
          },
          archive: {
            showExpandedAudioPlayer = false
            audioController.stop()
            viewModel.setLinkArchived(dataService: dataService, objectID: $0, archived: true)
          },
          viewArticle: { itemID in
            if let article = try? dataService.viewContext.existingObject(with: itemID) as? Models.LibraryItem {
              viewModel.pushFeedItem(item: article)
            }
          }
        )
      }
      .fullScreenCover(isPresented: $showLibraryDigest) {
        if #available(iOS 17.0, *) {
          NavigationView {
            FullScreenDigestView(dataService: dataService, audioController: audioController)
          }
        } else {
          Text("Sorry digest is only available on iOS 17 and above")
        }
      }
      .sheet(isPresented: $showDigestConfig) {
        if #available(iOS 17.0, *) {
          NavigationView {
            DigestConfigView(dataService: dataService, homeViewModel: viewModel)
          }
        } else {
          Text("Sorry digest is only available on iOS 17 and above")
        }
      }
      .toolbar {
        toolbarItems
      }
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        Task {
          await viewModel.loadNewItems(dataService: dataService)
        }
      }
      .sheet(isPresented: $searchPresented) {
        LibrarySearchView(homeFeedViewModel: self.viewModel)
      }
      .task {
        await viewModel.loadFilters(dataService: dataService)
        if viewModel.appliedFilter == nil {
          viewModel.setDefaultFilter()
        }
        // Once the user has seen at least one following item we stop displaying the
        // initial help view
        if viewModel.currentFolder == "following", viewModel.fetcher.items.count > 0 {
          viewModel.stopUsingFollowingPrimer = true
        }
        if dataService.digestNeedsRefresh() {
          await viewModel.checkForDigestUpdate(dataService: dataService)
        }
      }
      .environment(\.editMode, self.$isEditMode)
      .navigationBarTitleDisplayMode(.inline)
    }

    var toolbarItems: some ToolbarContent {
      Group {
        ToolbarItemGroup(placement: .barLeading) {
          if UIDevice.isIPhone || horizontalSizeClass != .compact {
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
        }

        ToolbarItemGroup(placement: .barTrailing) {
            if viewModel.appliedFilter?.name == "Deleted" {
              if viewModel.isEmptyingTrash {
                ProgressView()
              } else {
                Button(
                  action: {
                    viewModel.emptyTrash(dataService: dataService)
                  },
                  label: {
                    Text("Empty trash").tint(Color.blue)
                  })
                .buttonStyle(.plain)
                .foregroundColor(Color.blue)
              }
            } else {
              if isEditMode == .active {
                Button(action: { isEditMode = .inactive }, label: { Text("Cancel") })
              } else {
                if #available(iOS 17.0, *), dataService.featureFlags.digestEnabled {
                  Button(
                    action: { showLibraryDigest = true },
                    label: { viewModel.digestIsUnread ? Image.tabDigestSelected : Image.tabDigest }
                  )
                  .buttonStyle(.plain)
                  .padding(.trailing, 4)
                } else if #available(iOS 17.0, *), !dataService.featureFlags.digestEnabled, !viewModel.hideDigestIcon {
                  Button(
                    action: { showDigestConfig = true },
                    label: { Image.tabDigestSelected }
                  )
                  .buttonStyle(.plain)
                  .padding(.trailing, 4)
                }
                if prefersListLayout {
                  Button(
                    action: { isEditMode = isEditMode == .active ? .inactive : .active },
                    label: {
                      Image
                        .selectMultiple
                        .foregroundColor(Color.toolbarItemForeground)
                    }
                  ).buttonStyle(.plain)
                    .padding(.horizontal, UIDevice.isIPad ? 5 : 0)
                }
                if enableGrid {
                  Button(
                    action: { prefersListLayout.toggle() },
                    label: {
                      Image(systemName: prefersListLayout ? "square.grid.2x2" : "list.bullet")
                        .foregroundColor(Color.toolbarItemForeground)
                    }
                  ).buttonStyle(.plain)
                    .padding(.horizontal, UIDevice.isIPad ? 5 : 0)
                }
              Button(
                action: {
                  if viewModel.currentFolder == "inbox" {
                    showAddLinkView = true
                  } else if viewModel.currentFolder == "following" {
                    viewModel.showAddFeedView = true
                  }
                },
                label: {
                  Image.addLink
                    .foregroundColor(Color.toolbarItemForeground)
                }
              ).buttonStyle(.plain)
                .padding(.horizontal, UIDevice.isIPad ? 5 : 0)

                Button(
                  action: {
                    searchPresented = true
                    isEditMode = .inactive
                  },
                  label: {
                    Image
                      .magnifyingGlass
                      .foregroundColor(Color.toolbarItemForeground)
                  }
                ).buttonStyle(.plain)
                  .padding(.horizontal, UIDevice.isIPad ? 5 : 0)
            }
          }
        }

        ToolbarItemGroup(placement: .bottomBar) {
          if isEditMode == .active {
            Button(action: {
              viewModel.bulkAction(dataService: dataService, action: .delete, items: Array(selection))
              isEditMode = .inactive
            }, label: { Image.toolbarTrash })
            .disabled(selection.count < 1)
            .padding(.horizontal, UIDevice.isIPad ? 10 : 5)
            Spacer()
            Text("\(selection.count) selected").font(.footnote)
            Spacer()
            Button(action: {
              viewModel.bulkAction(dataService: dataService, action: .archive, items: Array(selection))
              isEditMode = .inactive
            }, label: { Image.toolbarArchive })
            .disabled(selection.count < 1)
            .padding(.horizontal, UIDevice.isIPad ? 10 : 5)
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
    var slideTransition: PresentationLinkTransition {
      PresentationLinkTransition.slide(
        options: PresentationLinkTransition.SlideTransitionOptions(
          edge: .trailing,
          options: PresentationLinkTransition.Options(
            modalPresentationCapturesStatusBarAppearance: true
          )
        ))
    }

    var body: some View {
      VStack(spacing: 0) {
        if let linkRequest = viewModel.linkRequest, viewModel.currentListConfig?.hasReadNowSection ?? false {
          PresentationLink(
            transition: PresentationLinkTransition.slide(
              options: PresentationLinkTransition.SlideTransitionOptions(
                edge: .trailing,
                options: PresentationLinkTransition.Options(
                  modalPresentationCapturesStatusBarAppearance: true,
                  preferredPresentationBackgroundColor: ThemeManager.currentBgColor
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
        PresentationLink(transition: slideTransition, isPresented: $viewModel.linkIsActive) {
          if let presentingItem = viewModel.selectedItem {
            if presentingItem.isPDF {
              PDFContainerView(item: presentingItem)
            } else {
              WebReaderContainerView(item: presentingItem)
            }
          } else {
            EmptyView()
          }
        } label: {
          EmptyView()
        }.buttonStyle(.plain)

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
            listTitle: $listTitle,
            isListScrolled: $isListScrolled,
            prefersListLayout: $prefersListLayout,
            isEditMode: $isEditMode,
            selection: $selection,
            viewModel: viewModel,
            showFeatureCards: showFeatureCards
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

    var filtersHeader: some View {
      FiltersHeader(viewModel: viewModel)
        .overlay(Rectangle()
          .padding(.leading, 15)
          .frame(width: nil, height: 0.5, alignment: .bottom)
          .foregroundColor(isListScrolled && UIDevice.isIPhone ? Color(hex: "#3D3D3D") : Color.systemBackground), alignment: .bottom)
        .dynamicTypeSize(.small ... .accessibility1)
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
            }).buttonStyle(.plain)
            Spacer()
          }
          .padding(.top, 10)
          .padding(.horizontal, 15)

          GeometryReader { geo in
            ScrollView(.horizontal, showsIndicators: false) {
              if viewModel.fetcher.featureItems.count > 0 {
                HStack(alignment: .top, spacing: 15) {
                  Spacer(minLength: 1).frame(width: 1)
                  ForEach(viewModel.fetcher.featureItems) { item in
                    LibraryFeatureCardNavigationLink(item: item, viewModel: viewModel)
                  }
                  Spacer(minLength: 1).frame(width: 1)
                }
                .padding(.top, 0)
              } else {
                Text((FeaturedItemFilter(rawValue: viewModel.fetcher.featureFilter) ?? .continueReading).emptyMessage)
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

    var listItems: some View {
      ForEach(Array(viewModel.fetcher.items.enumerated()), id: \.1.unwrappedID) { idx, item in
        let horizontalInset = CGFloat(UIDevice.isIPad ? 20 : 10)

        LibraryItemListNavigationLink(
          item: item,
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
          libraryItemMenu(dataService: dataService, viewModel: viewModel, item: item)
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
          if let listConfig = viewModel.currentListConfig {
            ForEach(listConfig.leadingSwipeActions, id: \.self) { action in
              swipeActionButton(action: action, item: item)
            }
          }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
          if let listConfig = viewModel.currentListConfig {
            ForEach(listConfig.trailingSwipeActions, id: \.self) { action in
              swipeActionButton(action: action, item: item)
            }
          }
        }
        .onAppear {
          if idx >= viewModel.fetcher.items.count - 5 {
            Task {
              await viewModel.loadMore(dataService: dataService)
            }
          }

          // reload this in case it was changed in settings
          viewModel.hideFeatureSection = UserDefaults.standard.bool(forKey: UserDefaultKey.hideFeatureSection.rawValue)
        }
      }
    }

    @State private var isAnimating = false

    var progress: some View {
        GeometryReader { geometry in
            VStack {
                Spacer()
                Rectangle()
                    .fill(Color.yellow)
                    .frame(height: 2)
                    .offset(x: self.isAnimating ? geometry.size.width - 40 : 0)
                    .frame(width: self.isAnimating ? geometry.size.width : 40)
                    .animation(Animation.linear(duration: 2).repeatForever(autoreverses: true))
                Spacer()
            }
            .onAppear {
                self.isAnimating = true
            }
            .frame(height: 2)
        }
        .background(.clear)
        .edgesIgnoringSafeArea(.all)
    }

    var body: some View {
      VStack(spacing: 0) {
        if viewModel.showLoadingBar == .simple {
          progress
            .frame(height: 2)
            .frame(maxWidth: .infinity)
            .listRowSeparator(.hidden, edges: .all)
            .listRowInsets(.init(top: 0, leading: 0, bottom: 0, trailing: 0))
        } else {
          Color.systemBackground.frame(height: 2)
        }
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

                if viewModel.isEmptyingTrash {
                    VStack {
                      Text("Emptying trash")
                      ProgressView()
                    }
                    .frame(minHeight: 400)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .listRowSeparator(.hidden, edges: .all)
                } else if viewModel.fetcher.items.isEmpty {
                  EmptyState(viewModel: viewModel)
                    .listRowSeparator(.hidden, edges: .all)
                } else {
                  listItems
                }
              }
            }, header: {
              filtersHeader
            })
            if viewModel.showLoadingBar == .none {
              BottomView(viewModel: viewModel)
            }
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
      }
      .alert("The Following tab will be hidden. You can add it back from the filter settings in your profile.",
             isPresented: $viewModel.showHideFollowingAlert) {
        Button("OK", role: .destructive) {
          viewModel.hideFollowingTab = true
        }
        Button(LocalText.cancelGeneric, role: .cancel) { viewModel.showHideFollowingAlert = false }
      }
      .introspectNavigationController { nav in
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
            withAnimation(.linear(duration: 0.4)) {
              viewModel.removeLibraryItem(dataService: dataService, objectID: item.objectID)
            }
          },
          label: {
            Label("Remove", systemImage: "trash")
          }
        ).tint(.red))
      case .moveToInbox:
        return AnyView(Button(
          action: {
            withAnimation(.linear(duration: 0.4)) {
              viewModel.moveToFolder(dataService: dataService, item: item, folder: "inbox")
            }
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
      FiltersHeader(viewModel: viewModel)
        .overlay(Rectangle()
          .padding(.leading, 15)
          .frame(width: nil, height: 0.5, alignment: .bottom)
          .foregroundColor(isListScrolled && UIDevice.isIPhone ? Color(hex: "#3D3D3D") : Color.systemBackground), alignment: .bottom)
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
            if viewModel.showLoadingBar == .redacted  || viewModel.showLoadingBar == .simple {
              VStack {
                ProgressView()
              }
              .frame(minHeight: 400)
              .frame(maxWidth: .infinity)
              .padding()
              .listRowSeparator(.hidden, edges: .all)
            } else {
              if !viewModel.fetcher.items.isEmpty {
                ForEach(Array(viewModel.fetcher.items.enumerated()), id: \.1.id) { idx, item in
                  LibraryItemGridCardNavigationLink(
                    item: item,
                    viewModel: viewModel
                  )
                  .contextMenu {
                    libraryItemMenu(dataService: dataService, viewModel: viewModel, item: item)
                  }
                  .onAppear {
                    if idx >= viewModel.fetcher.items.count - 5 {
                      Task {
                        await viewModel.loadMore(dataService: dataService)
                      }
                    }
                  }
                }
              }
            }
            Spacer()
          }
          .frame(maxHeight: .infinity)
          .padding()
          .background(
            GeometryReader {
              Color(.systemBackground).preference(
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

          if viewModel.fetcher.items.isEmpty || viewModel.showLoadingBar == .redacted  || viewModel.showLoadingBar == .simple {
            EmptyState(viewModel: viewModel)
          } else {
            HStack {
              Spacer()
              BottomView(viewModel: viewModel).frame(maxWidth: 300)
              Spacer()
            }
          }

          if viewModel.fetcher.items.isEmpty, viewModel.isLoading {
            LoadingSection()
          }
        }
        .background(Color(.systemBackground))

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
  public extension View {
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

struct BottomView: View {
  @ObservedObject var viewModel: HomeFeedViewModel
  @EnvironmentObject var dataService: DataService

  @State var autoLoading = false

  var body: some View {
    innerBody
      .listRowSeparator(.hidden)
      .onAppear {
        Task {
          autoLoading = true
          await viewModel.loadMore(dataService: dataService)
          autoLoading = false
        }
      }
  }

  var innerBody: some View {
    if viewModel.fetcher.items.count < 3 {
      AnyView(Color.clear)
    } else if viewModel.appliedFilter?.name == "Deleted" {
      AnyView(Color.clear)
    } else {
      AnyView(HStack {
        if let totalCount = viewModel.fetcher.totalCount {
          Text("\(viewModel.fetcher.items.count) of \(totalCount) items.")
        }
        Spacer()
        if viewModel.isLoading {
          ProgressView()
        } else {
          Button(action: {
            Task {
              await viewModel.loadMore(dataService: dataService)
            }
          }, label: {
            if let totalCount = viewModel.fetcher.totalCount, viewModel.fetcher.items.count >= totalCount {
              Text("Check for more")
            } else {
              Text("Fetch more")
            }
          })
            .foregroundColor(Color.blue)
        }
      }.padding(10))
    }
  }
}
