
import Introspect
import Models
import Services
import SwiftUI
import Views

struct LibraryAddFeedView: View {
  let dismiss: () -> Void
  @State var newLinkURL: String = ""
  @EnvironmentObject var dataService: DataService

  let toastOperationHandler: ToastOperationHandler?

  enum FocusField: Hashable {
    case addLinkEditor
  }

  @FocusState private var focusedField: FocusField?

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
            .navigationTitle("Add Feed URL")
            .navigationBarTitleDisplayMode(.inline)
        }
      #else
        innerBody
      #endif
    }
    #if os(macOS)
      .padding()
    #endif
    .onAppear {
      focusedField = .addLinkEditor
    }
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          dismissButton
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          NavigationLink(
            destination: LibraryScanFeedView(
              dismiss: self.dismiss,
              viewModel: LibraryAddFeedViewModel(dataService: dataService, feedURL: newLinkURL, toastOperationHandler: toastOperationHandler)
            ),
            label: { Text("Add").bold() }
          )
        }
      }
    #endif
  }

  var cancelButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
    )
  }

  var pasteboardString: String? {
    #if os(iOS)
      UIPasteboard.general.url?.absoluteString
    #else
      NSPasteboard.general.string(forType: NSPasteboard.PasteboardType.URL)
    #endif
  }

  var innerBody: some View {
    Group {
      TextField("Feed or site URL", text: $newLinkURL)
      #if os(iOS)
        .keyboardType(.URL)
      #endif
      .autocorrectionDisabled(true)
        .textFieldStyle(StandardTextFieldStyle())
//        .focused($focusedField, equals: .addLinkEditor)

      Button(action: {
        if let url = pasteboardString {
          newLinkURL = url
        } else {
          //        viewModel.error("No URL on pasteboard")
        }
      }, label: {
        Text("Get from pasteboard")
      })
    }
  }

  var dismissButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.genericClose) }
    )
  }
}
