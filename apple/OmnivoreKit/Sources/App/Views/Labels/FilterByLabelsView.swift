import Models
import Services
import SwiftUI
import Views

struct FilterByLabelsView: View {
  let initiallySelected: [LinkedItemLabel]
  let initiallyNegated: [LinkedItemLabel]
  let onSave: (([LinkedItemLabel], [LinkedItemLabel]) -> Void)?

  @StateObject var viewModel = FilterByLabelsViewModel()
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode

  func isNegated(_ label: LinkedItemLabel) -> Bool {
    viewModel.negatedLabels.contains(where: { $0.id == label.id })
  }

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    viewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var innerBody: some View {
    List {
      ForEach(viewModel.labels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
        Button(
          action: {
            if isSelected(label) {
              viewModel.selectedLabels.removeAll(where: { $0.id == label.id })
            } else {
              viewModel.selectedLabels.append(label)
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
    }
    .listStyle(PlainListStyle())
    .navigationTitle("Filter by Label")
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(
            action: { presentationMode.wrappedValue.dismiss() },
            label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
          )
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          Button(
            action: {
              onSave?(viewModel.selectedLabels, viewModel.negatedLabels)
              presentationMode.wrappedValue.dismiss()
            },
            label: { Text(LocalText.doneGeneric).foregroundColor(.appGrayTextContrast) }
          )
        }
      }
    #endif
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
              placement: .navigationBarDrawer(displayMode: .always),
              prompt: "Filter Labels"
            )
        #else
          innerBody
        #endif
      }
    }
    .task {
      await viewModel.loadLabels(
        dataService: dataService,
        initiallySelectedLabels: initiallySelected,
        initiallyNegatedLabels: initiallyNegated
      )
    }
  }
}
