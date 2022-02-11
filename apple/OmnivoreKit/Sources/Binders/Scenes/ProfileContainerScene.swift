import Services
import SwiftUI
import Views

extension ProfileContainerViewModel {
  static func make(services: Services) -> ProfileContainerViewModel {
    let viewModel = ProfileContainerViewModel()
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .logout:
        services.authenticator.logout()
      case .loadProfileData:
        self?.loadProfileData(dataService: services.dataService)
      case .showIntercomMessenger:
        DataService.showIntercomMessenger?()
      case .deleteAccount:
        print("delete account")
      }
    }
    .store(in: &subscriptions)
  }

  private func loadProfileData(dataService: DataService) {
    dataService.viewerPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] viewer in
        self?.profileCardData = ProfileCardData(
          name: viewer.name,
          username: viewer.username,
          imageURL: viewer.profileImageURL.flatMap { URL(string: $0) }
        )
      }
    )
    .store(in: &subscriptions)
  }
}
