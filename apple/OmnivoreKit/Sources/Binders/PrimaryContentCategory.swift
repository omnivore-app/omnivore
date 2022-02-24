import SwiftUI
import Views

// TODO: maybe this can be removed??
enum PrimaryContentCategory: Identifiable, Hashable, Equatable {
  case feed(viewModel: HomeFeedViewModel)
  case profile(viewModel: ProfileContainerViewModel)

  static func == (lhs: PrimaryContentCategory, rhs: PrimaryContentCategory) -> Bool {
    lhs.id == rhs.id
  }

  var id: String {
    title
  }

  var title: String {
    switch self {
    case .feed:
      return "Home"
    case .profile:
      return "Profile"
    }
  }

  var image: Image {
    switch self {
    case .feed:
      return .homeTab
    case .profile:
      return .profileTab
    }
  }

  var listLabel: some View {
    Label { Text(title) } icon: { image.renderingMode(.template) }
  }

  @ViewBuilder var destinationView: some View {
    switch self {
    case let .feed(viewModel: viewModel):
      HomeFeedView(viewModel: viewModel)
    case let .profile(viewModel: viewModel):
      ProfileContainerView(viewModel: viewModel)
    }
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}
