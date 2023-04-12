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
            navigationModel.linkedItemFilter = filter
          }) {
            HStack {
              Text(filter.displayName)
              if navigationModel.linkedItemFilter == filter {
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
            if navigationModel.activeLabelIDs.contains(label.unwrappedID) {
              navigationModel.activeLabelIDs.remove(label.unwrappedID)
            } else {
              navigationModel.activeLabelIDs.insert(label.unwrappedID)
            }
          }) {
            HStack {
              Text(label.unwrappedName)
              if navigationModel.activeLabelIDs.contains(label.unwrappedID) {
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
