import Services
import SwiftUI
import Views

extension PrimaryContentViewModel {
  static func make(services: Services) -> PrimaryContentViewModel {
    PrimaryContentViewModel(
      homeFeedViewModel: HomeFeedViewModel.make(services: services),
      profileContainerViewModel: ProfileContainerViewModel.make(services: services)
    )
  }
}
