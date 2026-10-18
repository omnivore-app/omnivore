import Foundation
import Models
import Services
import SwiftUI

@MainActor
public struct LibrarySplitView: View {
  @EnvironmentObject var dataService: DataService
  @State var isEditMode: EditMode = .inactive

  @StateObject private var viewModel = HomeFeedViewModel(
    filterKey: "lastSelected",
    fetcher: LibraryItemFetcher(),
    folderConfigs: [
      "inbox": LibraryListConfig(
        hasFeatureCards: true,
        hasReadNowSection: true,
        leadingSwipeActions: [.pin],
        trailingSwipeActions: [.archive, .delete],
        cardStyle: .library
      ),
      "following": LibraryListConfig(
        hasFeatureCards: false,
        hasReadNowSection: false,
        leadingSwipeActions: [.moveToInbox],
        trailingSwipeActions: [.delete],
        cardStyle: .library
      )
    ]
  )

  private let syncManager = LibrarySyncManager()

  #if os(iOS)
    public var body: some View {
      NavigationView {
        LibrarySidebar(viewModel: viewModel)
          .navigationBarTitleDisplayMode(.inline)
          .navigationTitle("")

        HomeFeedContainerView(viewModel: viewModel, isEditMode: $isEditMode)
          .navigationViewStyle(.stack)
          .navigationBarTitleDisplayMode(.inline)
      }
      .navigationBarTitleDisplayMode(.inline)
      .accentColor(.appGrayTextContrast)
      .introspectSplitViewController {
        $0.preferredPrimaryColumnWidth = 230
        $0.displayModeButtonVisibility = .always
      }
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("PushLibraryItem"))) { notification in
        guard let libraryItemId = notification.userInfo?["libraryItemId"] as? String else { return }
        viewModel.pushLinkedRequest(request: LinkRequest(id: UUID(), serverID: libraryItemId))
      }
      .onOpenURL { url in
        viewModel.linkRequest = nil

        withoutAnimation {
          NotificationCenter.default.post(Notification(name: Notification.Name("PopToRoot")))
        }

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
      .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
        Task {
          await syncManager.syncUpdates(dataService: dataService)
        }
      }
      .onReceive(NSNotification.performSyncPublisher) { _ in
        Task {
          await syncManager.syncUpdates(dataService: dataService)
        }
      }
    }
  #endif

  #if os(macOS)
    public var body: some View {
      NavigationView {
        LibraryListView()
        Text(LocalText.navigationSelectLink)
      }
    }
  #endif
}
