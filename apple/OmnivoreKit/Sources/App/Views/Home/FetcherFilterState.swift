import Foundation
import Models
import Services
import SwiftUI
import Utils

@MainActor
class FetcherFilterState: ObservableObject {
  let folder: String

  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @Published var appliedFilter: InternalFilter? {
    didSet {
      let filterKey = UserDefaults.standard.string(forKey: "lastSelected-\(folder)-filter") ?? folder
      UserDefaults.standard.setValue(appliedFilter?.name, forKey: filterKey)
    }
  }

  init(folder: String) {
    self.folder = folder
  }
}
