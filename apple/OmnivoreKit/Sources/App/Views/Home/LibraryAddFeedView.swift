
import Introspect
import Models
import Services
import SwiftUI
import Views

struct LibraryAddFeedView: View {
  let dismiss: () -> Void
  @State var feedURL: String = ""
  @EnvironmentObject var dataService: DataService

  @State var prefetchContent = true
  @State var folderSelection = "following"
  @State var selectedLabels = [LinkedItemLabel]()

  let toastOperationHandler: ToastOperationHandler?

  enum FocusField: Hashable {
    case addLinkEditor
  }

  @FocusState private var focusedField: FocusField?

  var body: some View {
    Group {
      #if os(iOS)
        innerBody
          .navigationTitle("Add Feed URL")
          .navigationBarTitleDisplayMode(.inline)
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
              viewModel: LibraryAddFeedViewModel(
                dataService: dataService,
                feedURL: feedURL,
                toastOperationHandler: toastOperationHandler
              )
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
    List {
      Section {
        TextField("Feed or site URL", text: $feedURL)
        #if os(iOS)
          .keyboardType(.URL)
        #endif
        .autocorrectionDisabled(true)
          .textFieldStyle(StandardTextFieldStyle())
          .focused($focusedField, equals: .addLinkEditor)

        Button(action: {
          if let url = pasteboardString {
            feedURL = url
          } else {
            //        viewModel.error("No URL on pasteboard")
          }
        }, label: {
          Text("Get from pasteboard")
        })
      }

      Section {
        SubscriptionSettings(
          feedURL: $feedURL,
          prefetchContent: $prefetchContent,
          folderSelection: $folderSelection,
          selectedLabels: $selectedLabels
        )
      }
    }.listStyle(.insetGrouped)
  }

  var dismissButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.genericClose) }
    )
  }
}

private struct SubscriptionSettings: View {
  @Binding var feedURL: String
  @Binding var prefetchContent: Bool
  @Binding var folderSelection: String
  @Binding var selectedLabels: [LinkedItemLabel]

  @State var showLabelsSelector = false

  var folderRow: some View {
    HStack {
      Picker("Destination Folder", selection: $folderSelection) {
        Text("Inbox").tag("inbox")
        Text("Following").tag("following")
      }
      .pickerStyle(MenuPickerStyle())
    }
  }

  var labelRuleRow: some View {
    HStack {
      Text("Add Labels")
      Spacer()
      Button(action: { showLabelsSelector = true }, label: {
        Text("Create Rule")
      })
    }
  }

  var body: some View {
    Group {
      Toggle(isOn: $prefetchContent, label: { Text("Prefetch Content:") })
      folderRow
      labelRuleRow
    }
    .sheet(isPresented: $showLabelsSelector) {
      ApplyLabelsView(mode: .list(selectedLabels), onSave: { labels in
        selectedLabels = labels
      })
    }
  }
}
