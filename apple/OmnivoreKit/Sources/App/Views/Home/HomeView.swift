import SwiftUI
import Utils
import Views

struct HomeView: View {
  @StateObject private var viewModel = LibraryViewModel()

  #if os(iOS)
    var navView: some View {
      NavigationView {
        HomeFeedContainerView(viewModel: viewModel)
      }
      .navigationViewStyle(.stack)
      .accentColor(.appGrayTextContrast)
    }
  #endif

  var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        navView
      } else {
        HomeFeedContainerView(viewModel: viewModel)
      }
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
