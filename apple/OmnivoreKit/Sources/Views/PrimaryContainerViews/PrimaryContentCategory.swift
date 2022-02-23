import SwiftUI

public enum PrimaryContentCategory: Identifiable, Hashable, Equatable {
  case feed(viewModel: HomeFeedViewModel)
  case profile(viewModel: ProfileContainerViewModel)

  public static func == (lhs: PrimaryContentCategory, rhs: PrimaryContentCategory) -> Bool {
    lhs.id == rhs.id
  }

  public var id: String {
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

  var selectedImage: Image {
    switch self {
    case .feed:
      return .homeTabSelected
    case .profile:
      return .profileTabSelected
    }
  }

  public var listLabel: some View {
    Label { Text(title) } icon: { image.renderingMode(.template) }
  }

  @ViewBuilder public var destinationView: some View {
    switch self {
    case let .feed(viewModel: viewModel):
      HomeFeedView(viewModel: viewModel)
    case let .profile(viewModel: viewModel):
      ProfileContainerView(viewModel: viewModel)
    }
  }

  public func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}
