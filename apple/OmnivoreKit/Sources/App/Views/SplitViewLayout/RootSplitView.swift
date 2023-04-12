import Models
import SwiftUI
import Utils
import Views

final class NavigationModel: ObservableObject {
  @Published var linkedItemFilter = LinkedItemFilter.inbox
}

@available(iOS 16.0, *)
public struct RootSplitView: View {
  @StateObject private var labelsViewModel = LabelsViewModel()
  @StateObject private var libraryViewModel = LibraryViewModel()
  @StateObject private var navigationModel = NavigationModel()

  public var body: some View {
    NavigationSplitView {
      SplitViewSidebar(
        libraryViewModel: libraryViewModel,
        navigationModel: navigationModel,
        labelsViewModel: labelsViewModel
      )
    } content: {
      LibraryContainerView(viewModel: libraryViewModel)
        .navigationTitle("Library")
    } detail: {
      Text(LocalText.navigationSelectLink)
    }
    .accentColor(.appGrayTextContrast)
  }
}
