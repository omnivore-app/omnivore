import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

final class CreateProfileViewModel: ObservableObject {
  let initialUserProfile: UserProfile

  var hasSuggestedProfile: Bool {
    !(initialUserProfile.name.isEmpty && initialUserProfile.username.isEmpty)
  }

  var headlineText: String {
    hasSuggestedProfile ? "Confirm Your Profile" : "Create Your Profile"
  }

  var submitButtonText: String {
    hasSuggestedProfile ? "Confirm" : "Submit"
  }

  @Published var loginError: LoginError?
  @Published var validationErrorMessage: String?
  @Published var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername: String

  var subscriptions = Set<AnyCancellable>()

  init(initialUserProfile: UserProfile, dataService: DataService) {
    self.initialUserProfile = initialUserProfile
    self.potentialUsername = initialUserProfile.username

    $potentialUsername
      .debounce(for: .seconds(0.5), scheduler: DispatchQueue.main)
      .sink(receiveValue: { [weak self] username in
        self?.validateUsername(username: username, dataService: dataService)
      })
      .store(in: &subscriptions)
  }

  func submitProfile(name: String, bio: String, authenticator: Authenticator) {
    let profileOrError = UserProfile.make(
      username: potentialUsername,
      name: name,
      bio: bio.isEmpty ? nil : bio
    )

    switch profileOrError {
    case let .left(userProfile):
      submitProfile(userProfile: userProfile, authenticator: authenticator)
    case let .right(errorMessage):
      validationErrorMessage = errorMessage
    }
  }

  func validateUsername(username: String, dataService: DataService) {
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

  func submitProfile(userProfile: UserProfile, authenticator: Authenticator) {
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

struct CreateProfileContainerView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @ObservedObject private var viewModel: CreateProfileViewModel

  @State private var name: String
  @State private var bio = ""

  init(userProfile: UserProfile, dataService: DataService) {
    self.viewModel = CreateProfileViewModel(initialUserProfile: userProfile, dataService: dataService)
    self._name = State(initialValue: userProfile.name)
  }

  var body: some View {
    CreateProfileView(
      name: $name,
      potentialUsername: $viewModel.potentialUsername,
      headlineText: viewModel.headlineText,
      submitButtonText: viewModel.submitButtonText,
      validationErrorMessage: viewModel.validationErrorMessage,
      loginError: viewModel.loginError,
      potentialUsernameStatus: viewModel.potentialUsernameStatus,
      submitProfileAction: { viewModel.submitProfile(name: $0, bio: $1, authenticator: authenticator) }
    )
  }
}
