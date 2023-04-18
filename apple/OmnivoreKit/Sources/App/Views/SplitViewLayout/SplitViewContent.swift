import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

//@available(iOS 16.0, *)
struct SplitViewContent: View {
  @EnvironmentObject var dataService: DataService
  
  @ObservedObject var libraryViewModel: LibraryViewModel
  @ObservedObject var navigationModel: NavigationModel
  
  func loadItems(isRefresh: Bool) {
    Task {
      await libraryViewModel.loadItemsUsingNavigationModel(
        dataService: dataService, navigationModel: navigationModel, isRefresh: isRefresh
      )
    }
  }
  
  public var body: some View {
    LibraryListView(
      viewModel: libraryViewModel,
      navigationModel: navigationModel
    )
    .refreshable { loadItems(isRefresh: true) }
    .onChange(of: navigationModel.linkedItemFilter) { _ in loadItems(isRefresh: true) }
    .onChange(of: navigationModel.activeLabels) { _ in loadItems(isRefresh: true) }
    .task { loadItems(isRefresh: true) }
  }
}

struct LibraryContainerView: View {
  @State var hasHighlightMutations = false
  @State var searchPresented = false
  @State var addLinkPresented = false
  @State var settingsPresented = false

  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State var prefersListLayout = true
  @AppStorage(UserDefaultKey.shouldPromptCommunityModal.rawValue) var shouldPromptCommunityModal = true
  @ObservedObject var viewModel: LibraryViewModel

  func loadItems(isRefresh: Bool) {
    Task { await viewModel.loadItems(dataService: dataService, isRefresh: isRefresh) }
  }

  var body: some View {
    ZStack {
//      if let linkRequest = viewModel.linkRequest {
//        NavigationLink(
//          destination: WebReaderLoadingContainer(requestID: linkRequest.serverID),
//          tag: linkRequest,
//          selection: $viewModel.linkRequest
//        ) {
//          EmptyView()
//        }
//      }
      LibraryListView(viewModel: viewModel, navigationModel: NavigationModel())
//        .refreshable { loadItems(isRefresh: true) }
        .onChange(of: viewModel.searchTerm) { _ in loadItems(isRefresh: true) }
//        .onChange(of: viewModel.selectedLabels) { _ in loadItems(isRefresh: true) }
//        .onChange(of: viewModel.negatedLabels) { _ in loadItems(isRefresh: true) }
//        .onChange(of: viewModel.appliedFilter) { _ in loadItems(isRefresh: true) }
        .onChange(of: viewModel.appliedSort) { _ in loadItems(isRefresh: true) }
        .sheet(item: $viewModel.itemUnderLabelEdit) { item in
          ApplyLabelsView(mode: .item(item), isSearchFocused: false, onSave: nil)
        }
        .sheet(item: $viewModel.itemUnderTitleEdit) { item in
          LinkedItemMetadataEditView(item: item)
        }
        .sheet(item: $viewModel.itemForHighlightsView) { item in
          NotebookView(itemObjectID: item.objectID, hasHighlightMutations: $hasHighlightMutations)
        }
        .sheet(isPresented: $viewModel.showCommunityModal) {
          CommunityModal()
            .onAppear {
              shouldPromptCommunityModal = false
            }
        }
        .toolbar {
          ToolbarItem(placement: .barLeading) {
            Button(action: {
              viewModel.showCommunityModal = true
            }, label: {
              Image.smallOmnivoreLogo
                .renderingMode(.template)
                .resizable()
                .frame(width: 24, height: 24)
                .foregroundColor(.appGrayTextContrast)
                .overlay(alignment: .topTrailing, content: {
                  if shouldPromptCommunityModal {
                    Circle()
                      .fill(Color.red)
                      .frame(width: 6, height: 6)
                  }
                })
            })
          }
          ToolbarItem(placement: .barTrailing) {
            Button("", action: {})
              .disabled(true)
              .overlay {
                if viewModel.isLoading {
                  ProgressView()
                }
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
            EmptyView()
          }
        }
    }
    .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
      loadItems(isRefresh: false)
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
    .sheet(isPresented: $addLinkPresented) {
      NavigationView {
        LibraryAddLinkView()
      }
    }
    .sheet(isPresented: $settingsPresented) {
      NavigationView {
        ProfileView()
      }
    }
    .task {
      if viewModel.items.isEmpty {
        loadItems(isRefresh: false)
      }
    }
  }
}
