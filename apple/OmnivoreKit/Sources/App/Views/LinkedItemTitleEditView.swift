import Models
import Services
import SwiftUI
import Views

@MainActor final class LinkedItemTitleEditViewModel: ObservableObject {
  @Published var title = ""
  @Published var description = ""

  func load(item: LinkedItem) {
    title = item.unwrappedTitle
    description = item.descriptionText ?? ""
  }

  func submit(dataService: DataService, item: LinkedItem) {
    dataService.updateLinkedItemTitleAndDescription(
      itemID: item.unwrappedID,
      title: title,
      description: description
    )
  }
}

struct LinkedItemTitleEditView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
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
          .navigationTitle("Edit Title and Description")
          .navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .barTrailing) {
              Button(
                action: {
                  viewModel.submit(dataService: dataService, item: item)
                  presentationMode.wrappedValue.dismiss()
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
              label: { Text("Save").foregroundColor(.appGrayTextContrast) }
            )

            Button(
              action: { presentationMode.wrappedValue.dismiss() },
              label: { Text("Cancel").foregroundColor(.appGrayTextContrast) }
            )
          }
        }
        .frame(minWidth: 400, minHeight: 400)
    }
  #endif
}
