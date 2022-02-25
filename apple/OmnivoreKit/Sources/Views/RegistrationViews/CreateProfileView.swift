import Models
import SwiftUI
import Utils

public struct CreateProfileView: View {
  @Environment(\.horizontalSizeClass) var horizontalSizeClass

  @State private var bio = ""

  @Binding var name: String
  @Binding var potentialUsername: String
  let headlineText: String
  let submitButtonText: String
  let validationErrorMessage: String?
  let loginError: LoginError?
  let potentialUsernameStatus: PotentialUsernameStatus
  let submitProfileAction: (String, String) -> Void

  public init(
    name: Binding<String>,
    potentialUsername: Binding<String>,
    headlineText: String,
    submitButtonText: String,
    validationErrorMessage: String?,
    loginError: LoginError?,
    potentialUsernameStatus: PotentialUsernameStatus,
    submitProfileAction: @escaping (String, String) -> Void
  ) {
    self._name = name
    self._potentialUsername = potentialUsername
    self.headlineText = headlineText
    self.submitButtonText = submitButtonText
    self.validationErrorMessage = validationErrorMessage
    self.loginError = loginError
    self.potentialUsernameStatus = potentialUsernameStatus
    self.submitProfileAction = submitProfileAction
  }

  public var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 28) {
        ScrollView(showsIndicators: false) {
          if horizontalSizeClass == .regular {
            Spacer(minLength: 150)
          }
          VStack(alignment: .center, spacing: 16) {
            Text(headlineText)
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
                    TextField("", text: $potentialUsername)
                  }

                  if potentialUsernameStatus == .available {
                    Image(systemName: "checkmark.circle.fill")
                      .font(.appBody)
                      .foregroundColor(.green)
                  }
                }
                if let message = potentialUsernameStatus.message {
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
                action: { submitProfileAction(name, bio) },
                label: { Text(submitButtonText) }
              )
              .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))

              if let errorMessage = validationErrorMessage {
                Text(errorMessage)
                  .font(.appCaption)
                  .foregroundColor(.red)
              }

              if let loginError = loginError, validationErrorMessage == nil {
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
