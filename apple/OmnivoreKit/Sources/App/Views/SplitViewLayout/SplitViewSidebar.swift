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
            let isSelected = navigationModel.activeLabels.contains(label)
            ZStack {
              if isSelected {
                Color.appButtonBackground
              }
              HStack {
                Circle()
                  .fill(Color(hex: label.color ?? "") ?? .appButtonBackground)
                  .frame(width: 24, height: 24)
                Text(label.unwrappedName)
                Spacer()
                if isSelected {
                  Image(systemName: "checkmark")
                }
              }
              .padding(.horizontal)
            }
          }
        }
      }
    }
    .toolbar {
      ToolbarItem(placement: .barLeading) {
        Button(action: {
          print("tapped on logo")
        }, label: {
          Image.smallOmnivoreLogo
            .renderingMode(.template)
            .resizable()
            .frame(width: 24, height: 24)
            .foregroundColor(.appGrayTextContrast)
        })
      }
    }
    .task {
      await labelsViewModel.loadLabels(dataService: dataService)
    }
  }
}
