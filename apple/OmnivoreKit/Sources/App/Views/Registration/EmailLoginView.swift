import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class EmailLoginViewModel: ObservableObject {
  @Published var loginError: LoginError?

  func submitCredentials(
    email: String,
    password: String,
    authenticator: Authenticator
  ) async {
    do {
      try await authenticator.submitEmailLogin(email: email, password: password)
    } catch {
      loginError = error as? LoginError
    }
  }
}

struct EmailLoginView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @Environment(\.presentationMode) private var presentationMode
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = EmailLoginViewModel()

  @State private var email = ""
  @State private var password = ""

  var body: some View {
    NavigationView {
      VStack(spacing: 0) {
        VStack(spacing: 28) {
          ScrollView(showsIndicators: false) {
            if horizontalSizeClass == .regular {
              Spacer(minLength: 150)
            }
            VStack(alignment: .center, spacing: 16) {
              VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                  Text("Email")
                    .font(.appFootnote)
                    .foregroundColor(.appGrayText)
                  TextField("", text: $email)
                    .textContentType(.emailAddress)
                }

                VStack(alignment: .leading, spacing: 6) {
                  Text("Password")
                    .font(.appFootnote)
                    .foregroundColor(.appGrayText)
                  TextField("", text: $password)
                    .textContentType(.password)
                }

                Button(
                  action: {
                    Task {
                      await viewModel.submitCredentials(
                        email: email,
                        password: password,
                        authenticator: authenticator
                      )
                    }
                  },
                  label: { Text("Submit") }
                )
                .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

                if let loginError = viewModel.loginError {
                  LoginErrorMessageView(loginError: loginError)
                }
              }
              .textFieldStyle(StandardTextFieldStyle())
            }
          }
          .frame(maxWidth: .infinity, maxHeight: .infinity)

          Spacer()
        }
      }
      .frame(maxWidth: 300)
      .navigationTitle("Sign In")
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
