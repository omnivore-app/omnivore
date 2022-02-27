import Models
import Services
import SwiftUI
import Views

public struct PrimaryContentView: View {
  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        regularView
      } else {
        HomeFeedView()
      }
    #elseif os(macOS)
      regularView
    #endif
  }

  // ipad and mac view container
  private var regularView: some View {
    let categories = [
      PrimaryContentCategory.feed,
      PrimaryContentCategory.profile
    ]

    return NavigationView {
      // The first column is the sidebar.
      PrimaryContentSidebar(categories: categories)
        .navigationTitle("Categories")

      // Second column is the Primary Nav Stack
      PrimaryContentCategory.feed.destinationView

      // Add a third column for macOS only
      #if os(macOS)
        Text("Select a link from the feed")
      #endif
    }
    .accentColor(.appGrayTextContrast)
  }
}

struct PrimaryContentSidebar: View {
  @State private var selectedCategory: PrimaryContentCategory?
  let categories: [PrimaryContentCategory]

  var innerBody: some View {
    List(categories) { category in
      NavigationLink(
        destination: category.destinationView,
        tag: category,
        selection: $selectedCategory,
        label: { category.listLabel }
      )
    }
    .listStyle(SidebarListStyle())
  }

  var body: some View {
    #if os(iOS)
      innerBody
    #elseif os(macOS)
      innerBody
        .frame(minWidth: 200)
        .toolbar {
          ToolbarItem {
            Button(
              action: {
                NSApp.keyWindow?.firstResponder?.tryToPerform(
                  #selector(NSSplitViewController.toggleSidebar(_:)), with: nil
                )
              },
              label: { Label("Toggle sidebar", systemImage: "sidebar.left") }
            )
          }
        }
    #endif
  }
}
