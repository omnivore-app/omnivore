import Foundation
import Models
import Services
import SwiftUI

@MainActor
public struct LibrarySplitView: View {
  @EnvironmentObject var dataService: DataService

  @StateObject private var inboxViewModel = HomeFeedViewModel(
    folder: "inbox",
    fetcher: LibraryItemFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      hasReadNowSection: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var followingViewModel = HomeFeedViewModel(
    folder: "following",
    fetcher: LibraryItemFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: false,
      hasReadNowSection: false,
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.delete],
      cardStyle: .library
    )
  )

  private let syncManager = LibrarySyncManager()

  #if os(iOS)
    public var body: some View {
      NavigationView {
        LibrarySidebar(inboxViewModel: inboxViewModel, followingViewModel: followingViewModel)
          .navigationBarTitleDisplayMode(.inline)
          .navigationTitle("")

        HomeFeedContainerView(viewModel: inboxViewModel)
          .navigationViewStyle(.stack)
          .navigationBarTitleDisplayMode(.inline)
      }
      .navigationBarTitleDisplayMode(.inline)
      .accentColor(.appGrayTextContrast)
      .introspectSplitViewController {
        $0.preferredPrimaryColumnWidth = 230
        $0.displayModeButtonVisibility = .always
      }
      .onOpenURL { url in
        inboxViewModel.linkRequest = nil
        if let deepLink = DeepLink.make(from: url) {
          switch deepLink {
          case let .search(query):
            inboxViewModel.searchTerm = query
          case let .savedSearch(named):
            if let filter = inboxViewModel.findFilter(dataService, named: named) {
              inboxViewModel.appliedFilter = filter
            }
          case let .webAppLinkRequest(requestID):
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              withoutAnimation {
                inboxViewModel.linkRequest = LinkRequest(id: UUID(), serverID: requestID)
                inboxViewModel.presentWebContainer = true
              }
            }
          }
        }
        // selectedTab = "inbox"
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
