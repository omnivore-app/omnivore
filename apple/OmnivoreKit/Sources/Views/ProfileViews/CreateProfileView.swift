import Combine
import Models
import SwiftUI

public final class CreateProfileViewModel: ObservableObject {
  let initialUserProfile: UserProfile

  var hasSuggestedProfile: Bool {
    !(initialUserProfile.name.isEmpty && initialUserProfile.username.isEmpty)
  }

  var headlineText: String {
    hasSuggestedProfile ? "Confirm Your Profile" : "Create Your Profile"
  }

  var submitButtonText: String {
    hasSuggestedProfile ? "Confirm" : "Submit"
  }

  @Published public var loginError: LoginError?
  @Published var validationErrorMessage: String?
  @Published public var potentialUsernameStatus = PotentialUsernameStatus.noUsername
  @Published var potentialUsername: String

  public enum Action {
    case submitProfile(userProfile: UserProfile)
    case validateUsername(username: String)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(initialUserProfile: UserProfile) {
    self.initialUserProfile = initialUserProfile
    self.potentialUsername = initialUserProfile.username

    $potentialUsername
      .debounce(for: .seconds(0.5), scheduler: DispatchQueue.main)
      .sink(receiveValue: { [weak self] username in
        self?.performActionSubject.send(.validateUsername(username: username))
      })
      .store(in: &subscriptions)
  }

  func submitProfile(name: String, bio: String) {
    let profileOrError = UserProfile.make(
      username: potentialUsername,
      name: name,
      bio: bio.isEmpty ? nil : bio
    )

    switch profileOrError {
    case let .left(userProfile):
      performActionSubject.send(.submitProfile(userProfile: userProfile))
    case let .right(errorMessage):
      validationErrorMessage = errorMessage
    }
  }
}

public struct CreateProfileView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @ObservedObject private var viewModel: CreateProfileViewModel

  @State private var name: String
  @State private var bio = ""

  public init(viewModel: CreateProfileViewModel) {
    self.viewModel = viewModel
    self._name = State(initialValue: viewModel.initialUserProfile.name)
  }

  private func didTapSubmitButton() {
    viewModel.submitProfile(name: name, bio: bio)
  }

  public var body: some View {
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
              .animation(.default)

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
                action: didTapSubmitButton,
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
