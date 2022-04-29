import Models
import Services
import SwiftUI
import Views

struct ApplyLabelsView: View {
  enum Mode {
    case item(LinkedItem)
    case list([LinkedItemLabel])

    var navTitle: String {
      switch self {
      case .item:
        return "Assign Labels"
      case .list:
        return "Apply Label Filters"
      }
    }

    var confirmButtonText: String {
      switch self {
      case .item:
        return "Save"
      case .list:
        return "Apply"
      }
    }
  }

  let mode: Mode
  let onSave: (([LinkedItemLabel]) -> Void)?

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = LabelsViewModel()

  var innerBody: some View {
    List {
      Section(header: Text("Assigned Labels")) {
        if viewModel.selectedLabels.isEmpty {
          Text("No labels are currently assigned.")
        }
        ForEach(viewModel.selectedLabels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
          HStack {
            TextChip(feedItemLabel: label)
            Spacer()
            Button(
              action: {
                withAnimation {
                  viewModel.removeLabelFromItem(label)
                }
              },
              label: { Image(systemName: "xmark.circle").foregroundColor(.appGrayTextContrast) }
            )
          }
        }
      }
      Section(header: Text("Available Labels")) {
        ForEach(viewModel.unselectedLabels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
          HStack {
            TextChip(feedItemLabel: label)
            Spacer()
            Button(
              action: {
                withAnimation {
                  viewModel.addLabelToItem(label)
                }
              },
              label: { Image(systemName: "plus").foregroundColor(.appGrayTextContrast) }
            )
          }
        }
      }
      Section {
        Button(
          action: { viewModel.showCreateEmailModal = true },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text("Create a new Label").foregroundColor(.appGrayTextContrast)
              Spacer()
            }
          }
        )
        .disabled(viewModel.isLoading)
      }
    }
    .navigationTitle(mode.navTitle)
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(
            action: { presentationMode.wrappedValue.dismiss() },
            label: { Text("Cancel").foregroundColor(.appGrayTextContrast) }
          )
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          Button(
            action: {
              switch mode {
              case let .item(feedItem):
                viewModel.saveItemLabelChanges(itemID: feedItem.unwrappedID, dataService: dataService)
              case .list:
                onSave?(viewModel.selectedLabels)
              }
              presentationMode.wrappedValue.dismiss()
            },
            label: { Text(mode.confirmButtonText).foregroundColor(.appGrayTextContrast) }
          )
        }
      }
    #endif
    .sheet(isPresented: $viewModel.showCreateEmailModal) {
      CreateLabelView(viewModel: viewModel)
    }
  }

  var body: some View {
    NavigationView {
      if viewModel.isLoading {
        EmptyView()
      } else {
        #if os(iOS)
          innerBody
            .searchable(
              text: $viewModel.labelSearchFilter,
              placement: .navigationBarDrawer(displayMode: .always)
            )
        #else
          innerBody
        #endif
      }
    }
    .task {
      switch mode {
      case let .item(feedItem):
        await viewModel.loadLabels(dataService: dataService, item: feedItem)
      case let .list(labels):
        await viewModel.loadLabels(dataService: dataService, initiallySelectedLabels: labels)
      }
    }
  }
}

private extension Sequence where Element == LinkedItemLabel {
  func applySearchFilter(_ searchFilter: String) -> [LinkedItemLabel] {
    if searchFilter.isEmpty {
      return map { $0 } // return the identity of the sequence
    }
    return filter { ($0.name ?? "").lowercased().contains(searchFilter.lowercased()) }
  }
}
