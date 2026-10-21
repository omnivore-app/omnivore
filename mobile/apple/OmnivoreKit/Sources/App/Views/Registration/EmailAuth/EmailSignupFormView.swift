import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

extension EmailAuthViewModel {
  func signUp(
    email: String,
    password: String,
    fullName: String,
    authenticator: Authenticator
  ) async {
    do {
      try await authenticator.submitUserSignUp(
        email: email,
        password: password,
        username: potentialUsername,
        name: fullName
      )
      emailAuthState = .pendingEmailVerification(email: email, password: password)
    } catch {
      loginError = error as? LoginError
      emailAuthState = .signUp
    }
  }

  func validateUsername(username: String, dataService: DataService) {
    if let status = PotentialUsernameStatus.validationError(username: username.lowercased()) {
      potentialUsernameStatus = status
      return
    }

    Task {
      do {
        try await dataService.validateUsernamePublisher(username: username)
        potentialUsernameStatus = .available
      } catch {
        let usernameError = (error as? UsernameAvailabilityError) ?? .unknown
        switch usernameError {
        case .tooShort:
          potentialUsernameStatus = .tooShort
        case .tooLong:
          potentialUsernameStatus = .tooLong
        case .invalidPattern:
          potentialUsernameStatus = .invalidPattern
        case .nameUnavailable:
          potentialUsernameStatus = .unavailable
        case .internalServer, .unknown:
          loginError = .unknown
        case .network:
          loginError = .network
        }
      }
    }
  }

  func configureUsernameValidation(dataService: DataService) {
    $potentialUsername
      .debounce(for: .seconds(0.5), scheduler: DispatchQueue.main)
      .sink(receiveValue: { [weak self] username in
        self?.validateUsername(username: username, dataService: dataService)
      })
      .store(in: &subscriptions)
  }
}

struct EmailSignupFormView: View {
  enum FocusedField {
    case email, password, fullName, username
  }

  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @ObservedObject var viewModel: EmailAuthViewModel

  @FocusState private var focusedField: FocusedField?
  @State private var email = ""
  @State private var password = ""
  @State private var name = ""
  @State private var username = ""

  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        ScrollView(showsIndicators: false) {
          if horizontalSizeClass == .regular {
            Spacer(minLength: isMacApp ? 50 : 150)
          }
          VStack {
            // Email
            VStack(alignment: .leading, spacing: 6) {
              Text(LocalText.genericEmail)
                .font(.appFootnote)
                .foregroundColor(.appGrayText)
              TextField("", text: $email)
                .focused($focusedField, equals: .email)
              #if os(iOS)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
              #endif
              .disableAutocorrection(true)
                .submitLabel(.next)
            }
            .padding(.bottom, 8)

            // Password
            VStack(alignment: .leading, spacing: 6) {
              Text(LocalText.genericPassword)
                .font(.appFootnote)
                .foregroundColor(.appGrayText)
              SecureField("", text: $password)
                .focused($focusedField, equals: .password)
              #if os(iOS)
                .textContentType(.newPassword)
                .textInputAutocapitalization(.never)
              #endif
              .disableAutocorrection(true)
                .submitLabel(.next)
            }
            .padding(.bottom, 8)

            // Full Name
            VStack(alignment: .leading, spacing: 6) {
              Text(LocalText.registrationFullName)
                .font(.appFootnote)
                .foregroundColor(.appGrayText)
              TextField("", text: $name)
                .focused($focusedField, equals: .fullName)
              #if os(iOS)
                .textContentType(.name)
              #endif
              .disableAutocorrection(true)
                .submitLabel(.next)
            }
            .padding(.bottom, 8)

            // Username
            VStack(alignment: .leading, spacing: 6) {
              HStack {
                VStack(alignment: .leading, spacing: 6) {
                  Text(LocalText.registrationUsername)
                    .font(.appFootnote)
                    .foregroundColor(.appGrayText)
                  TextField("", text: $viewModel.potentialUsername)
                    .focused($focusedField, equals: .username)
                  #if os(iOS)
                    .textInputAutocapitalization(.never)
                    .textContentType(.username)
                  #endif
                  .disableAutocorrection(true)
                    .submitLabel(.done)
                }

                if viewModel.potentialUsernameStatus == .available {
                  Image(systemName: "checkmark.circle.fill")
                    .font(.appBody)
                    .foregroundColor(.green)
                }
              }
              if let message = viewModel.potentialUsernameStatus.message {
                Text(message)
                  .font(.appCaption)
                  .foregroundColor(.red)
              }
            }
            .padding(.bottom, 16)
            .animation(.default, value: 0.35)

            Button(
              action: {
                viewModel.emailAuthState = .loading
                Task {
                  await viewModel.signUp(
                    email: email,
                    password: password,
                    fullName: name,
                    authenticator: authenticator
                  )
                }
              },
              label: {
                switch viewModel.emailAuthState {
                case .loading:
                  ProgressView()
                default:
                  Text(LocalText.genericSubmit)
                }
              }
            )
            .buttonStyle(SolidCapsuleButtonStyle(color: .appCtaYellow, textColor: Color.themeDarkGray, width: 300))

            if let loginError = viewModel.loginError {
              LoginErrorMessageView(loginError: loginError)
            }

            HStack {
              Button(
                action: { viewModel.emailAuthState = .signIn },
                label: {
                  Text(LocalText.registrationAlreadyHaveAccount)
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
            } else if focusedField == .password {
              focusedField = .fullName
            } else if focusedField == .fullName {
              focusedField = .username
            } else {
              focusedField = nil
            }
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)

        Spacer()
      }
    }
    .navigationTitle(focusedField == nil ? LocalText.registrationViewSignUpHeadline : "")
    .task {
      viewModel.configureUsernameValidation(dataService: dataService)
    }
  }
}
