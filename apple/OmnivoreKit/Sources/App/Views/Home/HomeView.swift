import SwiftUI

struct HomeView: View {
  @StateObject private var viewModel = HomeFeedViewModel()

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
    #endif
  }
}
