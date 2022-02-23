import AuthenticationServices
import Combine
import Models
import SwiftUI

enum AuthFlow {
  case signIn
  case signUp
}

public final class RegistrationViewModel: ObservableObject {
  @Published public var loginError: LoginError?
  @Published public var createProfileViewModel: CreateProfileViewModel?
  @Published public var newAppleSignupViewModel: NewAppleSignupViewModel?

  public enum Action {
    case googleButtonTapped
    case appleSignInCompleted(result: Result<ASAuthorization, Error>)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init() {}
}
