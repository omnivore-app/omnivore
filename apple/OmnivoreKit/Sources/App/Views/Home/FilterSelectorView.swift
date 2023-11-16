
// import Introspect
// import Models
// import Services
// import SwiftUI
// import Views
//
// @MainActor final class FilterSelectorViewModel: NSObject, ObservableObject {
//  @Published var isLoading = false
//  @Published var errorMessage: String = ""
//  @Published var showErrorMessage: Bool = false
//
//  func error(_ msg: String) {
//    errorMessage = msg
//    showErrorMessage = true
//    isLoading = false
//  }
// }
//
// struct FilterSelectorView: View {
//  @ObservedObject var viewModel: HomeFeedViewModel
//  @ObservedObject var filterViewModel = FilterByLabelsViewModel()
//  @EnvironmentObject var dataService: DataService
//  @Environment(\.dismiss) private var dismiss
//
//  @State var showLabelsSheet = false
//
//  init(viewModel: HomeFeedViewModel) {
//    self.viewModel = viewModel
//  }
//
//  var body: some View {
//    Group {
//      #if os(iOS)
//        List {
//          innerBody
//        }
//        .listStyle(.grouped)
//      #elseif os(macOS)
//        List {
//          innerBody
//        }
//        .listStyle(.plain)
//      #endif
//    }
//    #if os(iOS)
//      .navigationBarTitle("Library")
//      .navigationBarTitleDisplayMode(.inline)
//      .navigationBarItems(trailing: doneButton)
//    #endif
//  }
//
//  private var innerBody: some View {
//    Group {
//      Section {
//        ForEach(LinkedItemFilter.allCases, id: \.self) { filter in
//          HStack {
//            Text(filter.displayName)
//              .foregroundColor(filterState.appliedFilter == filter.rawValue ? Color.blue : Color.appTextDefault)
//            Spacer()
//            if filterState.appliedFilter == filter.rawValue {
//              Image(systemName: "checkmark")
//                .foregroundColor(Color.blue)
//            }
//          }
//          .contentShape(Rectangle())
//          .onTapGesture {
//            filterState.appliedFilter = filter.rawValue
//          }
//        }
//      }
//
//      Section("Labels") {
//        Button(
//          action: {
//            showLabelsSheet = true
//          },
//          label: {
//            HStack {
//              Text("Select Labels (\(filterState.selectedLabels.count))")
//              Spacer()
//              Image(systemName: "chevron.right")
//            }
//          }
//        )
//      }
//    }
//    .sheet(isPresented: $showLabelsSheet) {
//      FilterByLabelsView(
//        initiallySelected: filterState.selectedLabels,
//        initiallyNegated: filterState.negatedLabels
//      ) {
//        self.filterState.selectedLabels = $0
//        self.filterState.negatedLabels = $1
//      }
//    }
//    .task {
//      await filterViewModel.loadLabels(
//        dataService: dataService,
//        initiallySelectedLabels: filterState.selectedLabels,
//        initiallyNegatedLabels: filterState.negatedLabels
//      )
//    }
//  }
//
//  func isNegated(_ label: LinkedItemLabel) -> Bool {
//    filterViewModel.negatedLabels.contains(where: { $0.id == label.id })
//  }
//
//  func isSelected(_ label: LinkedItemLabel) -> Bool {
//    filterViewModel.selectedLabels.contains(where: { $0.id == label.id })
//  }
//
//  var doneButton: some View {
//    Button(
//      action: { dismiss() },
//      label: { Text("Done") }
//    )
//    .disabled(viewModel.isLoading)
//  }
// }
