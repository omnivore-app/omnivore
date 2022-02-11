import Combine
import Models
import SwiftUI
import Utils

public struct RegistrationView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @ObservedObject private var viewModel: RegistrationViewModel

  public init(viewModel: RegistrationViewModel) {
    self.viewModel = viewModel
  }

  var authenticationView: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        if horizontalSizeClass == .regular {
          Spacer()
        }

        VStack(alignment: .center, spacing: 16) {
          Text(LocalText.registrationViewHeadline)
            .font(.appTitle)
            .multilineTextAlignment(.center)
            .padding(.bottom, horizontalSizeClass == .compact ? 0 : 50)
            .padding(.top, horizontalSizeClass == .compact ? 30 : 0)

          AppleSignInButton {
            viewModel.performActionSubject.send(.appleSignInCompleted(result: $0))
          }

          if AppKeys.sharedInstance?.iosClientGoogleId != nil {
            GoogleAuthButton {
              viewModel.performActionSubject.send(.googleButtonTapped)
            }
          }
        }

        if let loginError = viewModel.loginError {
          LoginErrorMessageView(loginError: loginError)
        }

        Spacer()
      }
      .frame(maxWidth: 316)
      .padding(.horizontal, 16)
    }
  }

  public var body: some View {
    if let createProfileViewModel = viewModel.createProfileViewModel {
      CreateProfileView(viewModel: createProfileViewModel)
    } else if let newAppleSignupViewModel = viewModel.newAppleSignupViewModel {
      NewAppleSignupView(viewModel: newAppleSignupViewModel)
    } else {
      authenticationView
    }
  }
}
