import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

enum EmailAuthState {
  case signIn
  case signUp
  case loading
  case pendingEmailVerification(email: String, password: String)
}

@MainActor final class EmailAuthViewModel: ObservableObject {
  @Published var loginError: LoginError?
  @Published var emailAuthState = EmailAuthState.signIn
  @Published var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername = ""

  var subscriptions = Set<AnyCancellable>()
}

struct EmailAuthView: View {
  @Environment(\.presentationMode) private var presentationMode
  @StateObject private var viewModel = EmailAuthViewModel()

  @ViewBuilder var primaryContent: some View {
    switch viewModel.emailAuthState {
    case .signUp:
      EmailSignupFormView(viewModel: viewModel)
    case .signIn:
      EmailLoginFormView(viewModel: viewModel)
    case let .pendingEmailVerification(email, password):
      EmailPendingVerificationView(email: email, password: password, viewModel: viewModel)
    case .loading:
      VStack {
        Spacer()
        ProgressView()
        Spacer()
      }
    }
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackground.edgesIgnoringSafeArea(.all)
        primaryContent
          .frame(maxWidth: 300)
          .navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .barTrailing) {
              Button(
                action: { presentationMode.wrappedValue.dismiss() },
                label: { Image(systemName: "xmark").foregroundColor(.appGrayTextContrast) }
              )
            }
          }
      }
    }
  }
}
