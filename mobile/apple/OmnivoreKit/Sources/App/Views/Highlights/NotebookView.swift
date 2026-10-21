#if os(iOS)
  import CoreData
  import MarkdownUI
  import Models
  import Services
  import SwiftUI
  import Views

  typealias DeleteHighlightAction = (String) -> Void

  struct NotebookView: View {
    @StateObject var viewModel: NotebookViewModel

    @EnvironmentObject var dataService: DataService
    @Environment(\.presentationMode) private var presentationMode

    @State var showAnnotationModal = false
    @State var errorAlertMessage: String?
    @State var showErrorAlertMessage = false
    @State var noteAnnotation = ""

    @Binding var hasHighlightMutations: Bool
    @State var setLabelsHighlight: Highlight?
    @State var showShareView: Bool = false
    @State var showConfirmNoteDelete = false
    @State var onDeleteHighlight: DeleteHighlightAction?

    var emptyView: some View {
      Text(LocalText.highlightCardNoHighlightsOnPage)
        .multilineTextAlignment(.leading)
        .padding(16)
    }

    var innerBody: some View {
      listView
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
        }.alert("Are you sure you want to delete the note?",
                isPresented: $showConfirmNoteDelete) {
          Button("Remove Item", role: .destructive) {
            viewModel.deleteNote(dataService: dataService)
            showConfirmNoteDelete = false
          }
          Button(LocalText.cancelGeneric, role: .cancel) {
            showConfirmNoteDelete = false
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

    var noteSection: some View {
      HStack {
        // let isEmpty = viewModel.noteItem.annotation.isEmpty
        Spacer(minLength: 6)

        if let note = viewModel.noteItem, let annotation = note.annotation, !annotation.isEmpty {
          Markdown(annotation)
            .lineSpacing(6)
            .accentColor(.appGraySolid)
            .foregroundColor(.appGrayTextContrast)
            .font(.appSubheadline)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.appButtonBackground)
            .cornerRadius(8)
            .contextMenu {
              Button(
                action: { UIPasteboard.general.string = note.annotation },
                label: { Label("Copy", systemImage: "copy") }
              )
              Button(
                action: {
                  noteAnnotation = viewModel.noteItem?.annotation ?? ""
                  showAnnotationModal = true
                },
                label: { Label("Edit", systemImage: "edit") }
              )
            }
        } else {
          Text("Add Notes...")
            .lineSpacing(6)
            .accentColor(.appGraySolid)
            .foregroundColor(.appGrayText)
            .font(.appSubheadline)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.appButtonBackground)
            .cornerRadius(8)
        }
      }
      .onTapGesture {
        noteAnnotation = viewModel.noteItem?.annotation ?? ""
        showAnnotationModal = true
      }
    }

    var listView: some View {
      List {
        Section("Article Notes") {
          noteSection
            .listRowSeparator(.hidden, edges: .bottom)
        }
        Section("Highlights") {
          if viewModel.highlightItems.count > 0 {
            ForEach(Array(viewModel.highlightItems.enumerated()), id: \.offset) { idx, highlightParams in
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
                  if let onDeleteHighlight = onDeleteHighlight {
                    onDeleteHighlight(highlightParams.highlightID)
                  }
                },
                onSetLabels: { highlightID in
                  setLabelsHighlight = Highlight.lookup(byID: highlightID, inContext: dataService.viewContext)
                }
              )
              .listRowSeparator(.hidden, edges: idx == 0 ? .bottom : .all)
            }
          } else {
            emptyView
              .listRowSeparator(.hidden, edges: .bottom)
          }
        }
        Spacer(minLength: 120)
          .listRowSeparator(.hidden, edges: .all)
      }.sheet(item: $setLabelsHighlight) { highlight in
        ApplyLabelsView(mode: .highlight(highlight), onSave: { selectedLabels in
          hasHighlightMutations = true

          viewModel.setLabelsForHighlight(highlightID: highlight.unwrappedID,
                                          labels: selectedLabels,
                                          dataService: dataService)
        })
      }.sheet(isPresented: $showAnnotationModal) {
        NavigationView {
          HighlightAnnotationSheet(
            annotation: $noteAnnotation,
            onSave: {
              viewModel.updateNoteAnnotation(
                itemObjectID: viewModel.item.objectID,
                annotation: noteAnnotation,
                dataService: dataService
              )
              showAnnotationModal = false
              hasHighlightMutations = true
            },
            onCancel: {
              showAnnotationModal = false
            },
            errorAlertMessage: $errorAlertMessage,
            showErrorAlertMessage: $showErrorAlertMessage
          )
        }
        .navigationViewStyle(StackNavigationViewStyle())
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
          Button(
            action: { showConfirmNoteDelete = true },
            label: { Label("Delete Document Note", systemImage: "trash") }
          ).padding()
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
        viewModel.load(itemObjectID: viewModel.item.objectID, dataService: dataService)
      }
    }
  }
#endif
