import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class CreateProfileViewModel: ObservableObject {
  private(set) var initialUserProfile = NewUserProfile(username: "", name: "", bio: nil)
  var isConfigured = false

  var hasSuggestedProfile: Bool {
    !(initialUserProfile.name.isEmpty && initialUserProfile.username.isEmpty)
  }

  var headlineText: String {
    hasSuggestedProfile ? "Confirm Your Profile" : "Create Your Profile"
  }

  var submitButtonText: String {
    hasSuggestedProfile ? LocalText.genericConfirm : LocalText.genericSubmit
  }

  @Published var loginError: LoginError?
  @Published var validationErrorMessage: String?
  @Published var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername = ""

  var subscriptions = Set<AnyCancellable>()

  init() {}

  func submitProfile(name: String, authenticator: Authenticator) {
    let profileOrError = NewUserProfile.make(
      username: potentialUsername,
      name: name
    )

    switch profileOrError {
    case let .left(userProfile):
      Task {
        await submitProfile(userProfile: userProfile, authenticator: authenticator)
      }
    case let .right(errorMessage):
      validationErrorMessage = errorMessage
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

  func submitProfile(userProfile: NewUserProfile, authenticator: Authenticator) async {
    do {
      try await authenticator.createAccount(userProfile: userProfile)
    } catch {
      if let error = error as? LoginError {
        loginError = error
      }
    }
  }

  func configure(profile: NewUserProfile, dataService: DataService) {
    guard !isConfigured else { return }

    isConfigured = true
    initialUserProfile = profile
    potentialUsername = profile.username

    $potentialUsername
      .debounce(for: .seconds(2.0), scheduler: DispatchQueue.main)
      .sink(receiveValue: { [weak self] username in
        self?.validateUsername(username: username, dataService: dataService)
      })
      .store(in: &subscriptions)
  }
}

struct CreateProfileView: View {
  private let initialUserProfile: NewUserProfile
  @State private var isConfigured = false
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = CreateProfileViewModel()

  @State private var name = ""

  init(userProfile: NewUserProfile) {
    self.initialUserProfile = userProfile
  }

  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        ScrollView(showsIndicators: false) {
          if horizontalSizeClass == .regular {
            Spacer(minLength: 150)
          }
          VStack(alignment: .center, spacing: 16) {
            Text(viewModel.headlineText)
              .font(.appTitle)
              .multilineTextAlignment(.center)
              .padding(.bottom, horizontalSizeClass == .compact ? 0 : 50)
              .padding(.top, horizontalSizeClass == .compact ? 30 : 0)

            VStack(spacing: 16) {
              VStack(alignment: .leading, spacing: 6) {
                Text(LocalText.genericName)
                  .font(.appFootnote)
                  .foregroundColor(.appGrayText)
                #if os(iOS)
                  TextField("", text: $name)
                    .textContentType(.name)
                #elseif os(macOS)
                  TextField("", text: $name)
                #endif
              }

              VStack(alignment: .leading, spacing: 6) {
                HStack {
                  VStack(alignment: .leading, spacing: 6) {
                    Text(LocalText.registrationUsername)
                      .font(.appFootnote)
                      .foregroundColor(.appGrayText)
                    TextField("", text: $viewModel.potentialUsername)
                    #if os(iOS)
                      .textInputAutocapitalization(.never)
                    #endif
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
              .animation(.default, value: 0.35)

              Button(
                action: { viewModel.submitProfile(name: name, authenticator: authenticator) },
                label: { Text(viewModel.submitButtonText) }
              )
              .buttonStyle(SolidCapsuleButtonStyle(color: .appCtaYellow, textColor: Color.themeDarkGray, width: 300))

              if let errorMessage = viewModel.validationErrorMessage {
                Text(errorMessage)
                  .font(.appCaption)
                  .foregroundColor(.red)
              }

              if let loginError = viewModel.loginError, viewModel.validationErrorMessage == nil {
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
    .onAppear {
      guard !isConfigured else { return }
      isConfigured = true
      name = initialUserProfile.name
      viewModel.configure(profile: initialUserProfile, dataService: dataService)
    }
  }
}

extension PotentialUsernameStatus {
  var message: String? {
    switch self {
    case .tooShort:
      return "Username must contain at least 4 characters"
    case .tooLong:
      return "Username must be less than 15 characters"
    case .invalidPattern:
      return "Username can contain only letters and numbers"
    case .unavailable:
      return "This name is not available"
    case .noUsername, .available:
      return nil
    }
  }
}
