import Combine
import Models
import SwiftUI

public final class NewAppleSignupViewModel: ObservableObject {
  let userProfile: UserProfile
  @Published public var loginError: LoginError?

  public enum Action {
    case acceptProfile(userProfile: UserProfile)
    case changeProfile
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(userProfile: UserProfile) {
    self.userProfile = userProfile
  }
}

public struct NewAppleSignupView: View {
  @ObservedObject private var viewModel: NewAppleSignupViewModel

  public init(viewModel: NewAppleSignupViewModel) {
    self.viewModel = viewModel
  }

  public var body: some View {
    VStack(spacing: 28) {
      Text("Welcome to Omnivore!")
        .font(.appTitle)
        .multilineTextAlignment(.center)

      VStack(alignment: .center, spacing: 12) {
        Text("Your username is:")
          .font(.appBody)
          .foregroundColor(.appGrayText)
        Text("@\(viewModel.userProfile.username)")
          .font(.appHeadline)
          .foregroundColor(.appGrayText)
      }

      VStack {
        Button(
          action: { viewModel.performActionSubject.send(.acceptProfile(userProfile: viewModel.userProfile)) },
          label: { Text("Continue") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

        Button(
          action: { viewModel.performActionSubject.send(.changeProfile) },
          label: { Text("Change Username") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

        if let loginError = viewModel.loginError {
          LoginErrorMessageView(loginError: loginError)
        }
      }
    }
    .frame(maxWidth: 300)
  }
}
