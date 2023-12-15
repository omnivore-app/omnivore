import Foundation
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
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.archive, .delete],
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
      .onReceive(NSNotification.performSyncPublisher) { _ in
        Task {
          await syncManager.syncItems(dataService: dataService)
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
