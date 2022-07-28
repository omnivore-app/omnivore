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
      ZStack {
        Color.appBackground.edgesIgnoringSafeArea(.all)
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
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
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
                    action: { print("switch to email signup") },
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
}
