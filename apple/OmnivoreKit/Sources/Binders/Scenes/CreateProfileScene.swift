import Models
import Services
import SwiftUI
import Utils
import Views

extension CreateProfileViewModel {
  static func make(services: Services, pendingUserProfile: UserProfile) -> CreateProfileViewModel {
    let viewModel = CreateProfileViewModel(initialUserProfile: pendingUserProfile)
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case let .submitProfile(userProfile):
        self?.submitProfile(userProfile: userProfile, authenticator: services.authenticator)
      case let .validateUsername(username: username):
        self?.validateUsername(username: username, dataService: services.dataService)
      }
    }
    .store(in: &subscriptions)
  }

  private func validateUsername(username: String, dataService: DataService) {
    if let status = PotentialUsernameStatus.validationError(username: username.lowercased()) {
      potentialUsernameStatus = status
      return
    }

    dataService.validateUsernamePublisher(username: username).sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(usernameError) = completion else { return }
        switch usernameError {
        case .tooShort:
          self?.potentialUsernameStatus = .tooShort
        case .tooLong:
          self?.potentialUsernameStatus = .tooLong
        case .invalidPattern:
          self?.potentialUsernameStatus = .invalidPattern
        case .nameUnavailable:
          self?.potentialUsernameStatus = .unavailable
        case .internalServer, .unknown:
          self?.loginError = .unknown
        case .network:
          self?.loginError = .network
        }
      },
      receiveValue: { [weak self] in
        self?.potentialUsernameStatus = .available
      }
    )
    .store(in: &subscriptions)
  }

  private func submitProfile(userProfile: UserProfile, authenticator: Authenticator) {
    authenticator
      .createAccount(userProfile: userProfile).sink(
        receiveCompletion: { [weak self] completion in
          guard case let .failure(loginError) = completion else { return }
          self?.loginError = loginError
        },
        receiveValue: { _ in }
      )
      .store(in: &subscriptions)
  }
}
