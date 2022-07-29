import Models
import Services
import SwiftUI
import Utils
import Views

extension EmailAuthViewModel {
  func submitCredentials(
    email: String,
    password: String,
    authenticator: Authenticator
  ) async {
    do {
      try await authenticator.submitEmailLogin(email: email, password: password)
    } catch {
      if let newLoginError = error as? LoginError {
        if newLoginError == .pendingEmailVerification {
          emailAuthState = .pendingEmailVerification
        } else {
          loginError = newLoginError
        }
      }
    }
  }
}

struct EmailLoginFormView: View {
  enum FocusedField {
    case email, password
  }

  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @EnvironmentObject var authenticator: Authenticator
  @ObservedObject var viewModel: EmailAuthViewModel

  @FocusState private var focusedField: FocusedField?
  @State private var email = ""
  @State private var password = ""

  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        ScrollView(showsIndicators: false) {
          if horizontalSizeClass == .regular {
            Spacer(minLength: 150)
          }
          VStack {
            VStack(alignment: .leading, spacing: 6) {
              Text("Email")
                .font(.appFootnote)
                .foregroundColor(.appGrayText)
              TextField("", text: $email)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .focused($focusedField, equals: .email)
                .submitLabel(.next)
            }
            .padding(.bottom, 8)

            VStack(alignment: .leading, spacing: 6) {
              Text("Password")
                .font(.appFootnote)
                .foregroundColor(.appGrayText)
              SecureField("", text: $password)
                .textContentType(.password)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .focused($focusedField, equals: .password)
                .submitLabel(.done)
            }
            .padding(.bottom, 16)

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

            HStack {
              Button(
                action: { viewModel.emailAuthState = .signUp },
                label: {
                  Text("Don't have an account?")
                    .foregroundColor(.appGrayTextContrast)
                    .underline()
                }
              )
              .padding(.vertical)
              Spacer()
            }
          }
          .textFieldStyle(StandardTextFieldStyle())
          .onSubmit {
            if focusedField == .email {
              focusedField = .password
            } else {
              focusedField = nil
            }
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)

        Spacer()
      }
    }
    .navigationTitle("Sign In")
  }
}
