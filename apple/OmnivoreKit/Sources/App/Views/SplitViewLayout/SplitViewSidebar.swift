import SwiftUI
import Models
import Services

@available(iOS 16.0, *)
struct SplitViewSidebar: View {
  @EnvironmentObject var dataService: DataService
  
  @ObservedObject var libraryViewModel: LibraryViewModel
  @ObservedObject var navigationModel: NavigationModel
  @ObservedObject var labelsViewModel: LabelsViewModel
  
  public var body: some View {
    List {
      Section(header: Text("Saved Searches")) {
        ForEach(LinkedItemFilter.allCases, id: \.self) { filter in
          Button(action: {
            navigationModel.linkedItemFilter = filter.rawValue
          }) {
            HStack {
              Text(filter.displayName)
              if navigationModel.linkedItemFilter == filter.rawValue {
                Spacer()
                Image(systemName: "checkmark")
              }
            }
          }
        }
      }
      
      Section(header: Text("Labels")) {
        ForEach(labelsViewModel.labels) { label in
          Button(action: {
            if navigationModel.activeLabels.contains(label) {
              navigationModel.activeLabels.remove(label)
            } else {
              navigationModel.activeLabels.insert(label)
            }
          }) {
            HStack {
              Text(label.unwrappedName)
              if navigationModel.activeLabels.contains(label) {
                Spacer()
                Image(systemName: "checkmark")
              }
            }
          }
        }
      }
    }
    .navigationTitle("Filters")
    .task {
      await labelsViewModel.loadLabels(dataService: dataService)
    }
  }
}
