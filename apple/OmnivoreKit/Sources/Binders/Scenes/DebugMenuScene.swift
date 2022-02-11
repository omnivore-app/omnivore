import Services
import SwiftUI
import Views

extension DebugMenuViewModel {
  static func make(services: Services) -> DebugMenuViewModel {
    let viewModel = DebugMenuViewModel(initialEnvironment: services.dataService.appEnvironment)
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { action in
      switch action {
      case let .applyChanges(environment):
        switch environment {
        case .dev:
          services.switchAppEnvironment(to: .dev)
        case .demo:
          services.switchAppEnvironment(to: .demo)
        case .prod:
          services.switchAppEnvironment(to: .prod)
        case .local:
          services.switchAppEnvironment(to: .local)
        }
      }
    }
    .store(in: &subscriptions)
  }
}
