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

//  init(initiallySelected: [LinkedItemLabel], initiallyNegated: [LinkedItemLabel], onSave:) {
//
//  }

  func isNegated(_ label: LinkedItemLabel) -> Bool {
    viewModel.negatedLabels.contains(where: { $0.id == label.id })
  }

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    viewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var innerBody: some View {
    List {
      ForEach(viewModel.labels, id: \.self) { label in
        HStack {
          TextChip(feedItemLabel: label, negated: isNegated(label))
          Spacer()
          Button(action: {
            if isSelected(label) {
              viewModel.negatedLabels.append(label)
              viewModel.selectedLabels.removeAll(where: { $0.id == label.id })
            } else if isNegated(label) {
              viewModel.negatedLabels.removeAll(where: { $0.id == label.id })
            } else {
              viewModel.selectedLabels.append(label)
            }
          }, label: {
            if isNegated(label) {
              Image(systemName: "circle.slash")
            }
            if isSelected(label) {
              Image(systemName: "checkmark")
            }
          })
        }
      }
    }
    .listStyle(.plain)
    .navigationTitle("Filter by Label")
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
              onSave?(viewModel.selectedLabels, viewModel.negatedLabels)
              presentationMode.wrappedValue.dismiss()
            },
            label: { Text("Done").foregroundColor(.appGrayTextContrast) }
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
