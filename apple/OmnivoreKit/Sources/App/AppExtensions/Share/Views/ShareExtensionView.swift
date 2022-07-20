import Models
import Services
import SwiftUI
import Utils
import Views

public struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @StateObject private var viewModel = ShareExtensionViewModel()

  @State var reminderTime: ReminderTime?
  @State var hideUntilReminded = false

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
    #if os(iOS)
      if let data = try? Data(contentsOf: url), let img = UIImage(data: data) {
        return Image(uiImage: img)
      }
    #else
      if let data = try? Data(contentsOf: url), let img = NSImage(data: data) {
        return Image(nsImage: img)
      }
    #endif
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

      if let item = viewModel.linkedItem {
        // TODO: modify view to work for share ext only
        ApplyLabelsView(mode: .item(item), onSave: nil)
      }

      HStack {
        Button(
          action: { viewModel.handleReadNowAction(extensionContext: extensionContext) },
          label: { Text("Read Now").frame(maxWidth: .infinity) }
        )
        .buttonStyle(RoundedRectButtonStyle())

        Button(
          action: {
            extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
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
      viewModel.savePage(extensionContext: extensionContext)
    }
    .environmentObject(viewModel.services.dataService)
  }
}
