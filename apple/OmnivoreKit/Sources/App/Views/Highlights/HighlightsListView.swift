#if os(iOS)
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
    @State var setLabelsHighlight: Highlight?
    @State var showShareView: Bool = false

    var emptyView: some View {
      Text(LocalText.highlightCardNoHighlightsOnPage)
        .multilineTextAlignment(.center)
        .padding(16)
    }

    var innerBody: some View {
      (viewModel.highlightItems.count > 0 ? AnyView(listView) : AnyView(emptyView))
        .navigationTitle("Notebook")
        .listStyle(PlainListStyle())
      #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .navigationBarLeading) {
            dismissButton
          }
          ToolbarItem(placement: .navigationBarTrailing) {
            actionsMenu
          }
        }.formSheet(isPresented: $showShareView) {
          ShareSheet(activityItems: [viewModel.highlightsAsMarkdown()])
        }
      #else
        .toolbar {
          ToolbarItemGroup {
            dismissButton
          }
        }
      #endif
    }

    var listView: some View {
      List {
        Section {
          ForEach(viewModel.highlightItems) { highlightParams in
            HighlightsListCard(
              viewModel: self.viewModel,
              highlightParams: highlightParams,
              hasHighlightMutations: $hasHighlightMutations,
              onSaveAnnotation: {
                viewModel.updateAnnotation(
                  highlightID: highlightParams.highlightID,
                  annotation: $0,
                  dataService: dataService
                )
              },
              onDeleteHighlight: {
                hasHighlightMutations = true
                viewModel.deleteHighlight(
                  highlightID: highlightParams.highlightID,
                  dataService: dataService
                )
              },
              onSetLabels: { highlightID in
                setLabelsHighlight = Highlight.lookup(byID: highlightID, inContext: dataService.viewContext)
              }
            )
            .listRowSeparator(.hidden)
          }
        }
      }.sheet(item: $setLabelsHighlight) { highlight in
        ApplyLabelsView(mode: .highlight(highlight), isSearchFocused: false, onSave: { selectedLabels in
          hasHighlightMutations = true

          viewModel.setLabelsForHighlight(highlightID: highlight.unwrappedID,
                                          labels: selectedLabels,
                                          dataService: dataService)
        })
      }
    }

    var dismissButton: some View {
      Button(
        action: { presentationMode.wrappedValue.dismiss() },
        label: { Text(LocalText.genericClose) }
      )
    }

    var actionsMenu: some View {
      Menu(
        content: {
          Button(
            action: { showShareView = true },
            label: { Label(LocalText.exportGeneric, systemImage: "square.and.arrow.up") }
          )
        },
        label: {
          Image(systemName: "ellipsis")
            .foregroundColor(.appGrayTextContrast)
        }
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
#endif
