import Models
import SwiftUI
import Utils

public enum ShareExtensionStatus {
  case saving
  case processing
  case successfullySaved
  case failed(error: SaveArticleError)

  var displayMessage: String {
    switch self {
    case .saving:
      return LocalText.saveArticleSavingState
    case .successfullySaved:
      return LocalText.saveArticleSavedState
    case let .failed(error: error):
      return error.displayMessage
    case .processing:
      return LocalText.saveArticleProcessingState
    }
  }
}

private extension SaveArticleError {
  var displayMessage: String {
    switch self {
    case .unauthorized:
      return LocalText.extensionAppUnauthorized
    case .network:
      return LocalText.networkError
    case .badData, .unknown:
      return LocalText.genericError
    }
  }
}

struct IconButtonView: View {
  let title: String
  let systemIconName: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(alignment: .center, spacing: 8) {
        Image(systemName: systemIconName)
          .font(.appTitle)
          .foregroundColor(.appYellow48)
        Text(title)
          .font(.appBody)
          .foregroundColor(.appGrayText)
      }
      .frame(
        maxWidth: .infinity,
        maxHeight: .infinity
      )
      .background(Color.appButtonBackground)
      .cornerRadius(8)
    }
    .frame(height: 100)
  }
}

struct CheckmarkButtonView: View {
  let titleText: String
  let isSelected: Bool
  let action: () -> Void

  var body: some View {
    Button(
      action: action,
      label: {
        HStack {
          Text(titleText)
          Spacer()
          if isSelected {
            Image(systemName: "checkmark")
              .foregroundColor(.appYellow48)
          }
        }
        .padding(.vertical, 8)
      }
    )
    .buttonStyle(RectButtonStyle())
  }
}

public struct ShareExtensionChildView: View {
  let debugText: String?
  let title: String?
  let status: ShareExtensionStatus
  let onAppearAction: () -> Void
  let readNowButtonAction: () -> Void
  let dismissButtonTappedAction: (ReminderTime?, Bool) -> Void

  public init(
    debugText: String?,
    title: String?,
    status: ShareExtensionStatus,
    onAppearAction: @escaping () -> Void,
    readNowButtonAction: @escaping () -> Void,
    dismissButtonTappedAction: @escaping (ReminderTime?, Bool) -> Void
  ) {
    self.debugText = debugText
    self.title = title
    self.status = status
    self.onAppearAction = onAppearAction
    self.readNowButtonAction = readNowButtonAction
    self.dismissButtonTappedAction = dismissButtonTappedAction
  }

  @State var reminderTime: ReminderTime?
  @State var hideUntilReminded = false
  @State var readNowPending = false

  private func waitForReadNow() {
    readNowPending = true

    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
      switch status {
      case .successfullySaved:
        readNowButtonAction()
      case .failed(error: _):
        readNowPending = false
      case .saving, .processing:
        waitForReadNow()
      }
    }
  }

  private func handleReminderTimeSelection(_ selectedTime: ReminderTime) {
    if selectedTime == reminderTime {
      reminderTime = nil
      hideUntilReminded = false
    } else {
      reminderTime = selectedTime
      hideUntilReminded = true
    }
  }

  public var body: some View {
    VStack(alignment: .leading) {
      #if DEBUG
        if let debugText = debugText {
          Text(debugText)
        }
      #endif

      if let title = title {
        Text(title)
          .font(.appHeadline)
          .lineLimit(1)
          .padding(.trailing, 50)
        Divider()
      }

      Spacer()

      if case ShareExtensionStatus.successfullySaved = status {
        HStack(spacing: 4) {
          Text("Saved to Omnivore")
            .font(.appTitleThree)
            .foregroundColor(.appGrayText)
            .padding(.trailing, 16)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
            .lineLimit(nil)
        }
        .padding()
      } else if case let ShareExtensionStatus.failed(error) = status {
        HStack {
          Spacer()
          Text(error.displayMessage)
          Spacer()
        }
      } else {
        HStack {
          Spacer()
          Text("Saving...")
          Spacer()
        }
      }

      ScrollView {
        if FeatureFlag.enableRemindersFromShareExtension {
          VStack(spacing: 0) {
            CheckmarkButtonView(
              titleText: "Remind me tonight",
              isSelected: reminderTime == .tonight,
              action: { handleReminderTimeSelection(.tonight) }
            )

            Divider()

            CheckmarkButtonView(
              titleText: "Remind me tomorrow",
              isSelected: reminderTime == .tomorrow,
              action: { handleReminderTimeSelection(.tomorrow) }
            )

            Divider()

            CheckmarkButtonView(
              titleText: "Remind me this weekend",
              isSelected: reminderTime == .thisWeekend,
              action: { handleReminderTimeSelection(.thisWeekend) }
            )
          }
          .cornerRadius(8)
        }

        if FeatureFlag.enableSnoozeFromShareExtension {
          CheckmarkButtonView(
            titleText: "Hide it until then",
            isSelected: hideUntilReminded,
            action: { hideUntilReminded.toggle() }
          )
          .cornerRadius(8)
          .padding(.top, 16)
        }
      }
      .padding(.horizontal)

      HStack {
        if case ShareExtensionStatus.successfullySaved = status {
          Button(
            action: {
              if case ShareExtensionStatus.successfullySaved = status {
                readNowButtonAction()
              } else {
                waitForReadNow()
              }
            },
            label: {
              if readNowPending {
                ProgressView().frame(maxWidth: .infinity)
              } else {
                Text("Read Now").frame(maxWidth: .infinity)
              }
            }
          )
          .buttonStyle(RoundedRectButtonStyle())
        }
        Button(
          action: {
            dismissButtonTappedAction(reminderTime, hideUntilReminded)
          },
          label: {
            Text("Dismiss")
              .frame(maxWidth: .infinity)
          }
        )
        .buttonStyle(RoundedRectButtonStyle())
      }
      .padding(.horizontal)
      .padding(.bottom)
    }
    .frame(
      maxWidth: .infinity,
      maxHeight: .infinity,
      alignment: .topLeading
    )
    .onAppear {
      onAppearAction()
    }
  }
}
