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
          Button(filter.displayName) {
            print("tapped on \(filter.displayName)")
          }
        }
      }
      
      Section(header: Text("Labels")) {
        ForEach(labelsViewModel.labels) { label in
          Button(label.unwrappedName) {
            print("tapped on \(label.unwrappedName)")
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
