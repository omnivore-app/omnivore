import Introspect
import Models
import Services
import SwiftUI
import Views

@MainActor final class LibraryAddLinkViewModel: NSObject, ObservableObject {
  @Published var isLoading = false
  @Published var errorMessage: String = ""
  @Published var showErrorMessage: Bool = false

  @Environment(\.dismiss) private var dismiss

  func addLink(dataService: DataService, newLinkURL: String, dismiss: DismissAction) {
    isLoading = true
    Task {
      if URL(string: newLinkURL) == nil {
        error("Invalid link")
      } else {
        let result = try? await dataService.saveURL(id: UUID().uuidString, url: newLinkURL)
        if result == nil {
          error("Error adding link")
        } else {
          dismiss()
        }
      }
      isLoading = false
    }
  }

  func error(_ msg: String) {
    errorMessage = msg
    showErrorMessage = true
    isLoading = false
  }
}

struct LibraryAddLinkView: View {
  @StateObject var viewModel = LibraryAddLinkViewModel()

  @State var newLinkURL: String = ""
  @EnvironmentObject var dataService: DataService
  @Environment(\.dismiss) private var dismiss

  enum FocusField: Hashable {
    case addLinkEditor
  }

  @FocusState private var focusedField: FocusField?

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
            .navigationTitle("Add Link")
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
    .navigationTitle("Add Link")
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          dismissButton
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          viewModel.isLoading ? AnyView(ProgressView()) : AnyView(addButton)
        }
      }
    #endif
    .alert(viewModel.errorMessage,
           isPresented: $viewModel.showErrorMessage) {
      Button(LocalText.genericOk, role: .cancel) { viewModel.showErrorMessage = false }
    }
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
      TextField("Add Link", text: $newLinkURL)
      #if os(iOS)
        .keyboardType(.URL)
      #endif
      .autocorrectionDisabled(true)
        .textFieldStyle(StandardTextFieldStyle())
        .focused($focusedField, equals: .addLinkEditor)

      Button(action: {
        if let url = pasteboardString {
          newLinkURL = url
        } else {
          viewModel.error("No URL on pasteboard")
        }
      }, label: {
        Text("Get from pasteboard")
      })

      #if os(macOS)
        Spacer()
        HStack {
          cancelButton
          Spacer()
          addButton
        }
        .frame(maxWidth: .infinity)
      #endif
    }
  }

  var addButton: some View {
    Button(
      action: {
        viewModel.addLink(dataService: dataService, newLinkURL: newLinkURL, dismiss: dismiss)
      },
      label: { Text("Add").bold() }
    )
    .keyboardShortcut(.defaultAction)
    .onSubmit {
      viewModel.addLink(dataService: dataService, newLinkURL: newLinkURL, dismiss: dismiss)
    }
    .disabled(viewModel.isLoading)
  }

  var dismissButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.genericClose) }
    )
    .disabled(viewModel.isLoading)
  }
}
