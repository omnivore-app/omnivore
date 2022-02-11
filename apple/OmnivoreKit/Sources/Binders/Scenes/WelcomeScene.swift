import Services
import SwiftUI
import Utils
import Views

extension WelcomeViewModel {
  static func make(services: Services) -> WelcomeViewModel {
    let registrationViewModel = RegistrationViewModel.make(services: services)
    let viewModel = WelcomeViewModel(registrationViewModel: registrationViewModel)
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .hiddenGesturePerformed:
        if !Bundle.main.isAppStoreBuild {
          self?.debugMenuViewModel = DebugMenuViewModel.make(services: services)
          self?.showDebugModal = true
        }
      }
    }
    .store(in: &subscriptions)
  }
}
