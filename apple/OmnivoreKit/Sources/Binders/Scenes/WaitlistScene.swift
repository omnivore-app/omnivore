import Models
import Services
import SwiftUI
import Utils
import Views

extension WaitlistViewModel {
  static func make(services: Services) -> WaitlistViewModel {
    let viewModel = WaitlistViewModel()
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .logout:
        services.authenticator.logout()
      case .checkStatus:
        self?.updateWaitlistStatus(services: services)
      }
    }
    .store(in: &subscriptions)
  }

  private func updateWaitlistStatus(services: Services) {
    services.dataService.viewerPublisher().sink(
      receiveCompletion: { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      },
      receiveValue: { viewer in
        let isWaitlisted = viewer.isWaitlisted
        services.authenticator.updateWaitlistStatus(isWaitlistedUser: isWaitlisted)
      }
    )
    .store(in: &subscriptions)
  }
}
