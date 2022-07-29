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
  case pendingEmailVerification
}

@MainActor final class EmailAuthViewModel: ObservableObject {
  @Published var loginError: LoginError?
  @Published var emailAuthState = EmailAuthState.loading
  @Published var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername = ""

  var subscriptions = Set<AnyCancellable>()

  func loadAuthState() {
    // check tokens here to determine pending/active/no user
    emailAuthState = .signIn
  }
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
    case .pendingEmailVerification:
      Text("Verify Your email")
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
    .task {
      viewModel.loadAuthState()
    }
  }
}
