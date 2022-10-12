import SwiftUI

struct HomeView: View {
  @StateObject private var viewModel = HomeFeedViewModel()

  var navView: some View {
    NavigationView {
      HomeFeedContainerView(viewModel: viewModel)
    }
    .navigationViewStyle(.stack)
    .accentColor(.appGrayTextContrast)
  }

  var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        navView
      } else {
        HomeFeedContainerView(viewModel: viewModel)
      }
    #elseif os(macOS)
      HomeFeedView(viewModel: viewModel)
    #endif
  }
}
