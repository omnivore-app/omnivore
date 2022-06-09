import Models
import SwiftUI
import Utils

public class ShareExtensionChildViewModel: ObservableObject {
  @Published public var status: ShareExtensionStatus = .processing
  @Published public var title: String?
  @Published public var url: String?
  @Published public var iconURL: String?
  @Published public var requestId: String

  public init() {
    self.requestId = UUID().uuidString.lowercased()
  }
}

public enum ShareExtensionStatus {
  case processing
  case saved
  case synced
  case failed(error: SaveArticleError)
  case syncFailed(error: SaveArticleError)

  var displayMessage: String {
    switch self {
    case .processing:
      return LocalText.saveArticleProcessingState
    case .saved:
      return LocalText.saveArticleSavedState
    case .synced:
      return "Synced"
    case let .failed(error: error):
      return "Save failed \(error.displayMessage)"
    case let .syncFailed(error: error):
      return "Sync failed \(error.displayMessage)"
    }
  }
}

struct CornerRadiusStyle: ViewModifier {
  var radius: CGFloat
  var corners: UIRectCorner

  struct CornerRadiusShape: Shape {
    var radius = CGFloat.infinity
    var corners = UIRectCorner.allCorners

    func path(in rect: CGRect) -> Path {
      let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
      return Path(path.cgPath)
    }
  }

  func body(content: Content) -> some View {
    content
      .clipShape(CornerRadiusShape(radius: radius, corners: corners))
  }
}

extension View {
  func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
    ModifiedContent(content: self, modifier: CornerRadiusStyle(radius: radius, corners: corners))
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
  let viewModel: ShareExtensionChildViewModel
  let onAppearAction: () -> Void
  let readNowButtonAction: (String) -> Void
  let dismissButtonTappedAction: (ReminderTime?, Bool) -> Void

  @State var reminderTime: ReminderTime?
  @State var hideUntilReminded = false

  public init(
    viewModel: ShareExtensionChildViewModel,
    onAppearAction: @escaping () -> Void,
    readNowButtonAction: @escaping (String) -> Void,
    dismissButtonTappedAction: @escaping (ReminderTime?, Bool) -> Void
  ) {
    self.viewModel = viewModel
    self.onAppearAction = onAppearAction
    self.readNowButtonAction = readNowButtonAction
    self.dismissButtonTappedAction = dismissButtonTappedAction
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

  private var titleText: String {
    switch viewModel.status {
    case .saved, .synced, .syncFailed(error: _):
      return "Saved to Omnivore"
    case .processing:
      return "Saving to Omnivore"
    case .failed(error: _):
      return "Error saving to Omnivore"
    }
  }

  private var cloudIconName: String {
    switch viewModel.status {
    case .synced:
      return "checkmark.icloud"
    case .saved, .processing:
      return "icloud"
    case .failed(error: _), .syncFailed(error: _):
      return "exclamationmark.icloud"
    }
  }

  private var cloudIconColor: Color {
    switch viewModel.status {
    case .saved:
      return .appGrayText
    case .processing:
      return .clear
    case .failed(error: _), .syncFailed(error: _):
      return .red
    case .synced:
      return .blue
    }
  }

  private func localImage(from url: URL) -> Image? {
    if let data = try? Data(contentsOf: url), let img = UIImage(data: data) {
      return Image(uiImage: img)
    }
    return nil
  }

  public var previewCard: some View {
    HStack {
      if let iconURLStr = viewModel.iconURL, let iconURL = URL(string: iconURLStr) {
        if !iconURL.isFileURL {
          AsyncLoadingImage(url: iconURL) { imageStatus in
            if case let AsyncImageStatus.loaded(image) = imageStatus {
              image
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 61, height: 61)
                .clipped()
            } else {
              Color.appButtonBackground
                .aspectRatio(contentMode: .fill)
                .frame(width: 61, height: 61)
            }
          }
        } else {
          if let localImage = localImage(from: iconURL) {
            localImage
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: 61, height: 61)
              .clipped()
          } else {
            Color.appButtonBackground
              .aspectRatio(contentMode: .fill)
              .frame(width: 61, height: 61)
          }
        }
      } else {
        Color.appButtonBackground
          .aspectRatio(contentMode: .fill)
          .frame(width: 61, height: 61)
      }

      VStack(alignment: .leading) {
        Text(viewModel.title ?? "")
          .lineLimit(1)
          .foregroundColor(.appGrayText)
          .font(Font.system(size: 15, weight: .semibold))
        Text(viewModel.url ?? "")
          .lineLimit(1)
          .foregroundColor(.appGrayText)
          .font(Font.system(size: 12, weight: .regular))
      }
      Spacer()
      VStack {
        Spacer()
        Image(systemName: cloudIconName)
          .resizable()
          .aspectRatio(contentMode: .fill)
          .frame(width: 12, height: 12, alignment: .trailing)
          .foregroundColor(cloudIconColor)
          // .padding(.trailing, 6)
          .padding(EdgeInsets(top: 0, leading: 0, bottom: 8, trailing: 8))
      }
    }
    .background(Color.appButtonBackground)
    .frame(maxWidth: .infinity, maxHeight: 61)
    .cornerRadius(8)
  }

  public var body: some View {
    VStack(alignment: .leading) {
      Text(titleText)
        .foregroundColor(.appGrayText)
        .font(Font.system(size: 17, weight: .semibold))
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.top, 23)
        .padding(.bottom, 12)

      Rectangle()
        .foregroundColor(.appGrayText)
        .frame(maxWidth: .infinity, maxHeight: 1)
        .opacity(0.06)
        .padding(.top, 0)
        .padding(.bottom, 18)

      previewCard
        .padding(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))

      Spacer()

      HStack {
        Button(
          action: { readNowButtonAction(self.viewModel.requestId) },
          label: { Text("Read Now").frame(maxWidth: .infinity) }
        )
        .buttonStyle(RoundedRectButtonStyle())

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
