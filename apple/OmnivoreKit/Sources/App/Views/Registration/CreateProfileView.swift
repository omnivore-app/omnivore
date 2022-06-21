import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class CreateProfileViewModel: ObservableObject {
  private(set) var initialUserProfile = UserProfile(username: "", name: "", bio: nil)
  var isConfigured = false

  var hasSuggestedProfile: Bool {
    !(initialUserProfile.name.isEmpty && initialUserProfile.username.isEmpty)
  }

  var headlineText: String {
    hasSuggestedProfile ? "Confirm Your Profile" : "Create Your Profile"
  }

  var submitButtonText: String {
    hasSuggestedProfile ? "Confirm" : "Submit"
  }

  @Published var loginError: LoginError?
  @Published var validationErrorMessage: String?
  @Published var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername = ""

  var subscriptions = Set<AnyCancellable>()

  init() {}

  func submitProfile(name: String, bio: String, authenticator: Authenticator) {
    let profileOrError = UserProfile.make(
      username: potentialUsername,
      name: name,
      bio: bio.isEmpty ? nil : bio
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

    dataService.validateUsernamePublisher(username: username).sink(
      receiveCompletion: { [weak self] completion in
        guard case let .failure(usernameError) = completion else { return }
        switch usernameError {
        case .tooShort:
          self?.potentialUsernameStatus = .tooShort
        case .tooLong:
          self?.potentialUsernameStatus = .tooLong
        case .invalidPattern:
          self?.potentialUsernameStatus = .invalidPattern
        case .nameUnavailable:
          self?.potentialUsernameStatus = .unavailable
        case .internalServer, .unknown:
          self?.loginError = .unknown
        case .network:
          self?.loginError = .network
        }
      },
      receiveValue: { [weak self] in
        self?.potentialUsernameStatus = .available
      }
    )
    .store(in: &subscriptions)
  }

  func submitProfile(userProfile: UserProfile, authenticator: Authenticator) async {
    do {
      try await authenticator.createAccount(userProfile: userProfile)
    } catch {
      if let error = error as? LoginError {
        loginError = error
      }
    }
  }

  func configure(profile: UserProfile, dataService: DataService) {
    guard !isConfigured else { return }

    isConfigured = true
    initialUserProfile = profile
    potentialUsername = profile.username

    $potentialUsername
      .debounce(for: .seconds(0.5), scheduler: DispatchQueue.main)
      .sink(receiveValue: { [weak self] username in
        self?.validateUsername(username: username, dataService: dataService)
      })
      .store(in: &subscriptions)
  }
}

struct CreateProfileView: View {
  private let initialUserProfile: UserProfile
  @State private var isConfigured = false
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = CreateProfileViewModel()

  @State private var name = ""
  @State private var bio = ""

  init(userProfile: UserProfile) {
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
                Text("Name")
                  .font(.appFootnote)
                  .foregroundColor(.appGrayText)
                #if os(iOS)
                  TextField("", text: $name)
                    .textContentType(.name)
                    .keyboardType(.alphabet)
                #elseif os(macOS)
                  TextField("", text: $name)
                #endif
              }

              VStack(alignment: .leading, spacing: 6) {
                HStack {
                  VStack(alignment: .leading, spacing: 6) {
                    Text("Username")
                      .font(.appFootnote)
                      .foregroundColor(.appGrayText)
                    TextField("", text: $viewModel.potentialUsername)
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

              VStack(alignment: .leading, spacing: 6) {
                Text("Bio (optional)")
                  .font(.appFootnote)
                  .foregroundColor(.appGrayText)
                TextEditor(text: $bio)
                  .lineSpacing(6)
                  .accentColor(.appGraySolid)
                  .foregroundColor(.appGrayText)
                  .font(.appBody)
                  .padding(12)
                  .background(
                    RoundedRectangle(cornerRadius: 16)
                      .strokeBorder(Color.appGrayBorder, lineWidth: 1)
                      .background(RoundedRectangle(cornerRadius: 16).fill(Color.systemBackground))
                  )
                  .frame(height: 160)
              }

              Button(
                action: { viewModel.submitProfile(name: name, bio: bio, authenticator: authenticator) },
                label: { Text(viewModel.submitButtonText) }
              )
              .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

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

private extension PotentialUsernameStatus {
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
