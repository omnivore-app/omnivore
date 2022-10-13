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
          emailAuthState = .pendingEmailVerification(email: email, password: password)
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

  @EnvironmentObject var dataService: DataService
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @Environment(\.openURL) var openURL
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
              #if os(iOS)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
              #endif
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
              #if os(iOS)
                .textInputAutocapitalization(.never)
              #endif
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
            .buttonStyle(SolidCapsuleButtonStyle(color: .appCtaYellow, width: 300))

            if let loginError = viewModel.loginError {
              LoginErrorMessageView(loginError: loginError)
            }

            VStack(spacing: 0) {
              HStack {
                Button(
                  action: { viewModel.emailAuthState = .signUp },
                  label: {
                    Text("Don't have an account?")
                      .foregroundColor(.appGrayTextContrast)
                      .underline()
                  }
                )
                .padding(.vertical, 8)
                Spacer()
              }

              HStack {
                Button(
                  action: {
                    let url: URL = {
                      var urlComponents = URLComponents()
                      urlComponents.path = "/auth/forgot-password"
                      return urlComponents.url(relativeTo: dataService.appEnvironment.webAppBaseURL)!
                    }()
                    openURL(url)
                  },
                  label: {
                    Text("Forgot your password?")
                      .foregroundColor(.appGrayTextContrast)
                      .underline()
                  }
                )
                .padding(.vertical, 8)
                Spacer()
              }
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
    .navigationTitle(focusedField == nil ? "Sign In" : "")
  }
}

struct EmailPendingVerificationView: View {
  let email: String
  let password: String

  @ObservedObject var viewModel: EmailAuthViewModel
  @EnvironmentObject var authenticator: Authenticator

  var verificationMessage: String {
    "We've sent a verification email to \(email). Please verify your email and then tap the button below."
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(verificationMessage)
        .font(.appBody)

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
        label: { Text("Check Status") }
      )
      .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

      HStack {
        Button(
          action: { viewModel.emailAuthState = .signUp },
          label: {
            Text("Use a different email?")
              .foregroundColor(.appGrayTextContrast)
              .underline()
          }
        )
        .padding(.vertical)
        Spacer()
      }
    }
    .navigationTitle("Verify Email")
  }
}
