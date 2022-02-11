import Services
import SwiftUI
import Views

extension PrimaryContentViewModel {
  static func make(services: Services) -> PrimaryContentViewModel {
    let viewModel = PrimaryContentViewModel(
      homeFeedViewModel: HomeFeedViewModel.make(services: services),
      profileContainerViewModel: ProfileContainerViewModel.make(services: services)
    )
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services _: Services) {
    performActionSubject.sink { action in
      switch action {
      case .nothing:
        break
      }
    }
    .store(in: &subscriptions)
  }
}
