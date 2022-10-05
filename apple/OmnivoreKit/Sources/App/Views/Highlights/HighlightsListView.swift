import CoreData
import Models
import Services
import SwiftUI
import Views

struct HighlightsListView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = HighlightsListViewModel()

  let itemObjectID: NSManagedObjectID
  @Binding var hasHighlightMutations: Bool

  var innerBody: some View {
    List {
      Section {
        ForEach(viewModel.highlightItems) { highlightParams in
          HighlightsListCard(
            highlightParams: highlightParams,
            hasHighlightMutations: $hasHighlightMutations
          ) { newAnnotation in
            viewModel.updateAnnotation(
              highlightID: highlightParams.highlightID,
              annotation: newAnnotation,
              dataService: dataService
            )
          }
        }
      }
    }
    .navigationTitle("Highlights")
    .listStyle(PlainListStyle())
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          dismissButton
        }
      }
    #else
      .toolbar {
        ToolbarItemGroup {
          dismissButton
        }
      }
    #endif
  }

  var dismissButton: some View {
    Button(
      action: { presentationMode.wrappedValue.dismiss() },
      label: { Text("Done").foregroundColor(.appGrayTextContrast) }
    )
  }

  var body: some View {
    Group {
      #if os(iOS)
        NavigationView {
          innerBody
        }
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, minHeight: 400)
      #endif
    }
    .task {
      viewModel.load(itemObjectID: itemObjectID, dataService: dataService)
    }
  }
}
