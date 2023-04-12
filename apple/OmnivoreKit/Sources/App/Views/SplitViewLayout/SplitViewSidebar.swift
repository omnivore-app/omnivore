import SwiftUI

@available(iOS 16.0, *)
struct SplitViewSidebar: View {
  @ObservedObject var libraryViewModel: LibraryViewModel
  @ObservedObject var navigationModel: NavigationModel
  
  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]
  
  public var body: some View {
    List(categories, selection: $navigationModel.selectedCategory) { category in
      NavigationLink(value: category) {
        category.listLabel
      }
    }
    .navigationTitle("Categories")
  }
}
