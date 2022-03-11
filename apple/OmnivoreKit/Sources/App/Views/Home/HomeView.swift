import SwiftUI

struct HomeView: View {
  @StateObject private var viewModel = HomeFeedViewModel()

  var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone {
        NavigationView {
          HomeFeedContainerView(viewModel: viewModel)
            .toolbar {
              ToolbarItem {
                NavigationLink(
                  destination: { ProfileView() },
                  label: {
                    Image.profile
                      .resizable()
                      .frame(width: 26, height: 26)
                      .padding()
                  }
                )
              }
            }
        }
        .accentColor(.appGrayTextContrast)
      } else {
        HomeFeedContainerView(viewModel: viewModel)
      }
    #elseif os(macOS)
      HomeFeedView(viewModel: viewModel)
    #endif
  }
}
