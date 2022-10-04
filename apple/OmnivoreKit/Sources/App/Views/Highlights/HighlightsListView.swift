import Models
import Services
import SwiftUI
import Views

struct HighlightsListView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = HighlightsListViewModel()

  let item: LinkedItem

  var innerBody: some View {
    List {
      Section {
        ForEach(viewModel.highlights, id: \.self) { highlight in
          Text(highlight.quote ?? "no quote")
        }
      }
    }
    .navigationTitle("Highlights")
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
      viewModel.load(item: item)
    }
  }
}
