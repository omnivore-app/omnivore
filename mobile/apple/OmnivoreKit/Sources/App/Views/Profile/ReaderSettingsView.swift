import Services
import SwiftUI
import Views
import Utils

enum OpenLinkIn: String {
  case insideApp
  case systemBrowser
}

struct ReaderSettingsView: View {
  @Environment(\.dismiss) private var dismiss
  @AppStorage(UserDefaultKey.openExternalLinksIn.rawValue) var openExternalLinksIn = OpenLinkIn.insideApp.rawValue

  var body: some View {
    List {
      Picker(selection: $openExternalLinksIn, content: {
        Text("Inside app").tag(OpenLinkIn.insideApp.rawValue)
        Text("Use system browser").tag(OpenLinkIn.systemBrowser.rawValue)
      }, label: { Text("Open links:") })
      .pickerStyle(MenuPickerStyle())
    }.navigationTitle(LocalText.readerSettingsGeneric)
      .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
        dismiss()
      }
  }
}
