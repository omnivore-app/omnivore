import Models
import Services
import SwiftUI
import Views

@MainActor final class FilterByLabelsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var labels = [LinkedItemLabel]()
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var unselectedLabels = [LinkedItemLabel]()
  @Published var labelSearchFilter = ""

  func loadLabels(
    dataService: DataService,
    initiallySelectedLabels: [LinkedItemLabel],
    initiallyNegatedLabels: [LinkedItemLabel]
  ) async {
    isLoading = true

    if let labelIDs = try? await dataService.labels() {
      dataService.viewContext.performAndWait {
        self.labels = labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel }
      }

      for label in labels {
        if initiallySelectedLabels.contains(label) {
          selectedLabels.append(label)
        } else if initiallyNegatedLabels.contains(label) {
          negatedLabels.append(label)
        } else {
          unselectedLabels.append(label)
        }
      }
    }

    isLoading = false
  }
}
