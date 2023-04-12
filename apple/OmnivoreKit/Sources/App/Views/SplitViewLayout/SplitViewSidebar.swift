import SwiftUI

@available(iOS 16.0, *)
public struct SplitViewSidebar: View {
  @StateObject private var libraryViewModel = LibraryViewModel()
  @State private var selectedCategory: PrimaryContentCategory?
  
  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]
  
  public var body: some View {
    List(categories, selection: $selectedCategory) { category in
      NavigationLink(value: category) {
        category.listLabel
      }
    }
    .navigationTitle("Categories")
  }
}
