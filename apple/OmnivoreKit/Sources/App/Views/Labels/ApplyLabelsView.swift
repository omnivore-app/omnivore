import Models
import Services
import SwiftUI
import Views

struct ApplyLabelsView: View {
  enum Mode {
    case item(LinkedItem)
    case highlight(Highlight)
    case list([LinkedItemLabel])

    var navTitle: String {
      switch self {
      case .item, .highlight:
        return "Set Labels"
      case .list:
        return "Set Labels"
      }
    }

    var confirmButtonText: String {
      switch self {
      case .item, .highlight:
        return LocalText.genericSave
      case .list:
        return LocalText.doneGeneric
      }
    }
  }

  let mode: Mode
  let isSearchFocused: Bool
  let onSave: (([LinkedItemLabel]) -> Void)?

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = LabelsViewModel()

  enum ViewState {
    case mainView
    case editingTitle
    case editingLabels
    case viewingHighlight
  }

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    viewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var innerBody: some View {
    VStack {
      SearchBar(searchTerm: $viewModel.labelSearchFilter)
        .padding(.vertical, 8)
        .padding(.horizontal, 16)

      List {
        Section {
          ForEach(viewModel.labels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
            Button(
              action: {
                if isSelected(label) {
                  viewModel.selectedLabels.remove(label)
                } else {
                  viewModel.selectedLabels.insert(label)
                }
              },
              label: {
                HStack {
                  TextChip(feedItemLabel: label).allowsHitTesting(false)
                  Spacer()
                  if isSelected(label) {
                    Image(systemName: "checkmark")
                  }
                }
              }
            )
            .padding(.vertical, 5)
            #if os(macOS)
              .buttonStyle(PlainButtonStyle())
            #endif
          }
          createLabelButton
        }
      }
      .listStyle(PlainListStyle())

      Spacer()
    }
    .navigationTitle(mode.navTitle)
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          cancelButton
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          saveItemChangesButton
        }
      }
    #else
      .toolbar {
        ToolbarItemGroup {
          cancelButton
          saveItemChangesButton
        }
      }
    #endif
    .sheet(isPresented: $viewModel.showCreateLabelModal) {
      CreateLabelView(viewModel: viewModel, newLabelName: viewModel.labelSearchFilter)
    }
  }

  var createLabelButton: some View {
    Button(
      action: { viewModel.showCreateLabelModal = true },
      label: {
        HStack {
          Image(systemName: "tag").foregroundColor(.blue)
          Text(
            viewModel.labelSearchFilter.count > 0 ?
              "Create: \"\(viewModel.labelSearchFilter)\" label" :
              LocalText.createLabelMessage
          ).foregroundColor(.blue)
            .font(Font.system(size: 14))
          Spacer()
        }
      }
    )
    .buttonStyle(PlainButtonStyle())
    .disabled(viewModel.isLoading)
    .listRowSeparator(.hidden, edges: .bottom)
    .padding(.vertical, 10)
  }

  var saveItemChangesButton: some View {
    Button(
      action: {
        switch mode {
        case let .item(feedItem):
          viewModel.saveItemLabelChanges(itemID: feedItem.unwrappedID, dataService: dataService)
          onSave?(Array(viewModel.selectedLabels))
        case .highlight:
          onSave?(Array(viewModel.selectedLabels))
        case .list:
          onSave?(Array(viewModel.selectedLabels))
        }
        presentationMode.wrappedValue.dismiss()
      },
      label: { Text(mode.confirmButtonText).foregroundColor(.appGrayTextContrast) }
    )
  }

  var cancelButton: some View {
    Button(
      action: { presentationMode.wrappedValue.dismiss() },
      label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
    )
  }

  var body: some View {
    Group {
      #if os(iOS)
        NavigationView {
          if viewModel.isLoading {
            EmptyView()
          } else {
            innerBody
          }
        }
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, minHeight: 400)
      #endif
    }
    .task {
      switch mode {
      case let .item(feedItem):
        await viewModel.loadLabels(dataService: dataService, item: feedItem)
      case let .highlight(highlight):
        await viewModel.loadLabels(dataService: dataService, highlight: highlight)
      case let .list(labels):
        await viewModel.loadLabels(dataService: dataService, initiallySelectedLabels: labels)
      }
    }
  }
}

extension Sequence where Element == LinkedItemLabel {
  func applySearchFilter(_ searchFilter: String) -> [LinkedItemLabel] {
    if searchFilter.isEmpty {
      return map { $0 } // return the identity of the sequence
    }
    return filter { ($0.name ?? "").lowercased().contains(searchFilter.lowercased()) }
  }
}
