import Models
import Services
import SwiftUI
import Views

@MainActor final class LinkedItemMetadataEditViewModel: ObservableObject {
  @Published var title = ""
  @Published var description = ""
  @Published var author = ""

  func load(item: Models.LibraryItem) {
    title = item.unwrappedTitle
    author = item.author ?? ""
    description = item.descriptionText ?? ""
  }

  func submit(dataService: DataService, item: Models.LibraryItem) {
    dataService.updateLinkedItemTitleAndDescription(
      itemID: item.unwrappedID,
      title: title,
      description: description,
      // Don't set author to an empty string
      author: author.isEmpty ? nil : author
    )
  }
}

struct LinkedItemMetadataEditView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = LinkedItemMetadataEditViewModel()

  let item: Models.LibraryItem
  let onSave: ((String, String) -> Void)?

  init(item: Models.LibraryItem, onSave: ((String, String) -> Void)? = nil) {
    self.item = item
    self.onSave = onSave
  }

  var editForm: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .center, spacing: 16) {
        VStack(alignment: .leading, spacing: 6) {
          Text(LocalText.genericTitle)
            .font(.appFootnote)
            .foregroundColor(.appGrayTextContrast)
          TextField("", text: $viewModel.title)
            .textFieldStyle(StandardTextFieldStyle(textColor: .appGrayTextContrast))
        }

        VStack(alignment: .leading, spacing: 6) {
          Text(LocalText.genericAuthor)
            .font(.appFootnote)
            .foregroundColor(.appGrayTextContrast)
          TextField("", text: $viewModel.author)
            .textFieldStyle(StandardTextFieldStyle(textColor: .appGrayTextContrast))
        }

        VStack(alignment: .leading, spacing: 6) {
          Text(LocalText.genericDescription)
            .font(.appFootnote)
            .foregroundColor(.appGrayTextContrast)
          TextEditor(text: $viewModel.description)
            .lineSpacing(6)
            .accentColor(.appGraySolid)
            .foregroundColor(.appGrayTextContrast)
            .font(.appBody)
            .padding(12)
            .background(
              RoundedRectangle(cornerRadius: 8)
                .strokeBorder(Color.appGrayBorder, lineWidth: 1)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.systemBackground))
            )
            .frame(height: 200)
        }
      }
      .padding()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  var body: some View {
    Group {
      #if os(iOS)
        iOSBody
      #else
        macOSBody
      #endif
    }
    .task { viewModel.load(item: item) }
  }

  #if os(iOS)
    var iOSBody: some View {
      NavigationView {
        editForm
          .navigationTitle("Edit Info")
          .navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .barLeading) {
              Button(
                action: { presentationMode.wrappedValue.dismiss() },
                label: { Text(LocalText.cancelGeneric) }
              )
            }
            ToolbarItem(placement: .barTrailing) {
              Button(
                action: {
                  viewModel.submit(dataService: dataService, item: item)
                  if let onSave = self.onSave {
                    onSave(viewModel.title, viewModel.description)
                  }
                  presentationMode.wrappedValue.dismiss()
                },
                label: { Text(LocalText.genericSave).bold() }
              )
            }
          }
      }.navigationViewStyle(StackNavigationViewStyle())
    }
  #else
    var macOSBody: some View {
      editForm
        .toolbar {
          ToolbarItemGroup {
            Button(
              action: {
                viewModel.submit(dataService: dataService, item: item)
                presentationMode.wrappedValue.dismiss()
              },
              label: { Text(LocalText.genericSave).foregroundColor(.appGrayTextContrast) }
            )

            Button(
              action: { presentationMode.wrappedValue.dismiss() },
              label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
            )
          }
        }
        .frame(minWidth: 400, minHeight: 400)
    }
  #endif
}
