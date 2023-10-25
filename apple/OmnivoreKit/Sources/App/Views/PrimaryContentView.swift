import Models
import Services
import SwiftUI
import Views

@MainActor public struct PrimaryContentView: View {
  let categories = [
    PrimaryContentCategory.feed,
    PrimaryContentCategory.profile
  ]

  @State var searchTerm: String = ""

  public var body: some View {
    innerBody
  }

  public var innerBody: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        return AnyView(splitView)
      } else {
        return AnyView(
          LibraryTabView()
            .navigationViewStyle(.stack)
        )
      }
    #else
      return AnyView(splitView)
    #endif
  }

  #if os(macOS)
    private var splitView: some View {
      NavigationView {
        PrimaryContentCategory.feed.destinationView
        Text(LocalText.navigationSelectLink)
      }
    }
  #endif

  #if os(iOS)
    private var splitView: some View {
      NavigationView {
        // The first column is the sidebar.
        PrimaryContentSidebar(categories: categories)
          .navigationBarTitleDisplayMode(.inline)

        // Second column is the Primary Nav Stack
        PrimaryContentCategory.feed.destinationView
          .navigationBarTitleDisplayMode(.inline)
      }
      .navigationBarTitleDisplayMode(.inline)
      .accentColor(.appGrayTextContrast)
      .introspectSplitViewController {
        $0.preferredPrimaryColumnWidth = 160
        $0.displayModeButtonVisibility = .always
      }
    }
  #endif
}

@MainActor struct PrimaryContentSidebar: View {
  @State private var addLinkPresented = false
  @State private var showProfile = false
  @State private var selectedCategory: PrimaryContentCategory?
  let categories: [PrimaryContentCategory]

  var innerBody: some View {
    VStack(alignment: .leading, spacing: 20) {
      NavigationLink(
        destination: PrimaryContentCategory.feed.destinationView,
        tag: PrimaryContentCategory.feed,
        selection: $selectedCategory,
        label: { PrimaryContentCategory.feed.listLabel }
      )
      .listRowBackground(Color.systemBackground.cornerRadius(8))
      .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 20).padding(.leading, 20)

      Button(action: { showProfile = true }, label: {
        PrimaryContentCategory.profile.listLabel
      }).frame(maxWidth: .infinity, alignment: .leading).padding(.top, 5).padding(.leading, 20)

      Button(action: { addLinkPresented = true }, label: {
        Label("Add Link", systemImage: "plus.circle")
      }).frame(maxWidth: .infinity, alignment: .leading).padding(.top, 5).padding(.leading, 20)

      Spacer()
    }
    .dynamicTypeSize(.small ... .large)
    .sheet(isPresented: $addLinkPresented) {
      NavigationView {
        LibraryAddLinkView()
        #if os(iOS)
          .navigationBarTitleDisplayMode(.inline)
        #endif
      }
    }
    .sheet(isPresented: $showProfile) {
      NavigationView {
        PrimaryContentCategory.profile.destinationView
        #if os(iOS)
          .navigationBarTitleDisplayMode(.inline)
        #endif
      }
    }
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
              label: { Label(LocalText.navigationSelectSidebarToggle, systemImage: "sidebar.left") }
            )
          }
        }
    #endif
  }
}
