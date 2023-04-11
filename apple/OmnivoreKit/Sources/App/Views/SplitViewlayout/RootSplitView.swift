import SwiftUI
import Views

@available(iOS 16.0, *)
public struct RootSplitView: View {
  @State private var selectedCategory: PrimaryContentCategory?

  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]

  public var body: some View {
    NavigationSplitView {
      List(categories, selection: $selectedCategory) { category in
        NavigationLink(value: category) {
          category.listLabel
        }
      }
      .navigationTitle("Categories")
    } content: {
      PrimaryContentCategory.feed.destinationView
    } detail: {
      Text(LocalText.navigationSelectLink)
    }
    .accentColor(.appGrayTextContrast)
  }
}
