import Models
import Services
import SwiftUI
import Views

@MainActor final class LinkedItemTitleEditViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var title = ""
  @Published var description = ""
  @Published var errorMessage: String?

  func load(item: LinkedItem) {
    title = item.unwrappedTitle
    description = item.descriptionText ?? ""
  }

  func submit(dataService: DataService, item: LinkedItem) {
    isLoading = true
    print(item.title)
    print(dataService.currentViewer?.unwrappedName)
    isLoading = false
  }
}

struct LinkedItemTitleEditView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @Environment(\.horizontalSizeClass) var horizontalSizeClass
  @StateObject var viewModel = LinkedItemTitleEditViewModel()

  let item: LinkedItem

  var editForm: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .center, spacing: 16) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Title")
            .font(.appFootnote)
            .foregroundColor(.appGrayTextContrast)
          TextField("", text: $viewModel.title)
            .textFieldStyle(StandardTextFieldStyle(textColor: .appGrayTextContrast))
        }

        VStack(alignment: .leading, spacing: 6) {
          Text("Description")
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
            .frame(height: 160)
        }

        if let errorMessage = viewModel.errorMessage {
          Text(errorMessage)
            .font(.appCaption)
            .foregroundColor(.red)
        }
      }
      .padding()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  var body: some View {
    NavigationView {
      editForm
        .navigationTitle("Edit Title and Description")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .barTrailing) {
            Button(
              action: {
                viewModel.submit(dataService: dataService, item: item)
              },
              label: { Text("Save").foregroundColor(.appGrayTextContrast) }
            )
          }
          ToolbarItem(placement: .barLeading) {
            Button(
              action: { presentationMode.wrappedValue.dismiss() },
              label: { Text("Cancel").foregroundColor(.appGrayTextContrast) }
            )
          }
        }
    }
    .task { viewModel.load(item: item) }
  }
}
