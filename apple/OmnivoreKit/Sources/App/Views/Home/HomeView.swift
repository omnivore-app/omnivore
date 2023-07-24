import SwiftUI
import Utils
import Views

@MainActor
struct HomeView: View {
  @State private var viewModel: HomeFeedViewModel
  @State var showSnackbar = false
  @State var snackbarOperation: SnackbarOperation?

  init(viewModel: HomeFeedViewModel) {
    self.viewModel = viewModel
  }

  var body: some View {
    #if os(iOS)
      HomeFeedContainerView(viewModel: viewModel)
    #elseif os(macOS)
      HomeFeedView(viewModel: viewModel)
        .frame(minWidth: 320)
        .toolbar {
          ToolbarItem {
            Button(
              action: {
                NSApp.keyWindow?.firstResponder?.tryToPerform(
                  #selector(NSSplitViewController.toggleSidebar(_:)), with: nil
                )
              },
              label: { Label(LocalText.navigationSelectSidebarToggle, systemImage: "sidebar.left") }
            )
          }
        }

    #endif
  }
}
