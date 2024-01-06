import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class FilterByLabelsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var labels = [LinkedItemLabel]()
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var unselectedLabels = [LinkedItemLabel]()
  @Published var labelSearchFilter = ""

  func setLabels(_ labels: [LinkedItemLabel]) {
    let hideSystemLabels = PublicValet.hideLabels

    self.labels = labels.filter { !hideSystemLabels || !isSystemLabel($0) }.sorted { left, right in
      let aTrimmed = left.unwrappedName.trimmingCharacters(in: .whitespaces)
      let bTrimmed = right.unwrappedName.trimmingCharacters(in: .whitespaces)
      return aTrimmed.caseInsensitiveCompare(bTrimmed) == .orderedAscending
    }
  }

  func loadLabels(
    dataService: DataService,
    initiallySelectedLabels: [LinkedItemLabel],
    initiallyNegatedLabels: [LinkedItemLabel]
  ) async {
    isLoading = true
    errorMessage = nil
    await loadLabelsFromStore(dataService: dataService)
    for label in labels {
      if initiallySelectedLabels.contains(label) {
        selectedLabels.append(label)
      } else if initiallyNegatedLabels.contains(label) {
        negatedLabels.append(label)
      } else {
        unselectedLabels.append(label)
      }
    }
    isLoading = false

    if labels.isEmpty {
      isLoading = true
    }

    Task.detached(priority: .userInitiated) {
      if let labelIDs = try? await dataService.labels() {
        DispatchQueue.main.async {
          dataService.viewContext.performAndWait {
            self.setLabels(labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel })
          }
          for label in self.labels {
            if initiallySelectedLabels.contains(label) {
              self.selectedLabels.append(label)
            } else if initiallyNegatedLabels.contains(label) {
              self.negatedLabels.append(label)
            } else {
              self.unselectedLabels.append(label)
            }
          }
          self.isLoading = false
        }
      } else {
        DispatchQueue.main.async {
          self.errorMessage = "Error loading labels"
        }
      }
    }
  }

  func loadLabelsFromStore(dataService: DataService) async {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()

    let fetchedLabels = await dataService.viewContext.perform {
      try? fetchRequest.execute()
    }

    setLabels(fetchedLabels ?? [])
    unselectedLabels = fetchedLabels ?? []
  }

  func fetchLabelsFromNetwork(dataService: DataService) async {
    let labelIDs = try? await dataService.labels()
    guard let labelIDs = labelIDs else { return }

    let fetchedLabels = await dataService.viewContext.perform {
      labelIDs.compactMap { dataService.viewContext.object(with: $0) as? LinkedItemLabel }
    }

    setLabels(fetchedLabels)
    unselectedLabels = fetchedLabels
  }
}
