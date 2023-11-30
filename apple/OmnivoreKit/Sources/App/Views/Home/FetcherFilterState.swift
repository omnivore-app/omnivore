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
      let newValue = appliedFilter?.name.lowercased()
      UserDefaults.standard.setValue(newValue, forKey: "lastSelected-\(folder)-filter")
    }
  }

  init(folder: String) {
    self.folder = folder
    let newValue = appliedFilter?.name.lowercased()
    let appliedFilterKey = UserDefaults.standard.string(forKey: "lastSelected-\(folder)-filter")
  }
}
