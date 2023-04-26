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
            let isSelected = navigationModel.linkedItemFilter == filter.rawValue
            ZStack {
              if isSelected {
                Color.appYellow48
              }
              HStack {
                Text(filter.displayName)
                  .foregroundColor(isSelected ? Color.black : Color.systemLabel)
                Spacer()
              }
              .padding(.horizontal)
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
    .task {
      await labelsViewModel.loadLabels(dataService: dataService)
    }
  }
}
