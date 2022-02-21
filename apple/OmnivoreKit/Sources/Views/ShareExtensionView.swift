import Combine
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

public final class ShareExtensionViewModel: ObservableObject {
  public enum Action {
    case savePage(requestID: String)
    case copyLinkButtonTapped
    case readNowButtonTapped
    case archiveButtonTapped
    case dismissButtonTapped(reminderTime: ReminderTime?, hideUntilReminded: Bool)
  }

  @Published public var title: String?
  @Published public var status = ShareExtensionStatus.successfullySaved
  @Published public var debugText: String?

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()
  public let requestID = UUID().uuidString.lowercased()

  public init() {}
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

public struct ShareExtensionView: View {
  @State private var reminderTime: ReminderTime?
  @State private var hideUntilReminded = false

  @ObservedObject private var viewModel: ShareExtensionViewModel

  public init(viewModel: ShareExtensionViewModel) {
    self.viewModel = viewModel
  }

  private var savedStateView: some View {
    HStack {
      Spacer()
      IconButtonView(
        title: "Read Now",
        systemIconName: "book",
        action: {
          viewModel.performActionSubject.send(.readNowButtonTapped)
        }
      )
      Spacer()
    }
    .padding(.horizontal, 8)
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
        if let debugText = viewModel.debugText {
          Text(debugText)
        }
      #endif

      if let title = viewModel.title {
        Text(title)
          .font(.appHeadline)
          .lineLimit(1)
          .padding(.trailing, 50)
        Divider()
      }

      Spacer()

      if case ShareExtensionStatus.successfullySaved = viewModel.status {
        if FeatureFlag.enableReadNowFromShareExtension {
          savedStateView
        } else {
          HStack(spacing: 4) {
            Text("Link saved and will be available in your inbox shortly.")
              .font(.appTitleThree)
              .foregroundColor(.appGrayText)
              .padding(.trailing, 16)
              .multilineTextAlignment(.center)
              .fixedSize(horizontal: false, vertical: true)
              .lineLimit(nil)
          }
          .padding()
        }
      } else if case let ShareExtensionStatus.failed(error) = viewModel.status {
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

      Button(
        action: {
          viewModel.performActionSubject
            .send(.dismissButtonTapped(
              reminderTime: reminderTime,
              hideUntilReminded: hideUntilReminded
            ))
        },
        label: {
          Text("Dismiss")
            .frame(maxWidth: .infinity)
        }
      )
      .buttonStyle(RoundedRectButtonStyle())
      .padding(.horizontal)
      .padding(.bottom)
    }
    .frame(
      maxWidth: .infinity,
      maxHeight: .infinity,
      alignment: .topLeading
    )
    .onAppear {
      viewModel.performActionSubject.send(.savePage(requestID: viewModel.requestID))
    }
  }
}

#if DEBUG
  struct ShareExtensionViewPreview: PreviewProvider {
    public struct ContainerView: View {
      let shareExtensionViewModel: ShareExtensionViewModel
      @State var showExtensionModal = true

      public var body: some View {
        Button("Show Extension") {
          showExtensionModal = true
        }
        .popover(isPresented: $showExtensionModal) {
          ShareExtensionView(viewModel: shareExtensionViewModel)
        }
      }
    }

    static var previews: some View {
      registerFonts()

      let viewModel = ShareExtensionViewModel()
      viewModel.status = .successfullySaved
      return ShareExtensionView(viewModel: viewModel)
        .preferredColorScheme(.dark)
    }
  }
#endif
