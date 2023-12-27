
import Foundation
import Services
import SwiftUI

@MainActor struct LibrarySidebar: View {
  @ObservedObject var viewModel: HomeFeedViewModel
  @EnvironmentObject var dataService: DataService

  @State private var addLinkPresented = false
  @State private var showProfile = false
  @State private var selection: String?

  @State private var selectedFilter: InternalFilter?

  @AppStorage("inboxActive") private var inboxActive = true
  @AppStorage("followingActive") private var followingActive = false

  @AppStorage("inboxMenuState") var inboxMenuState = "open"
  @AppStorage("followingMenuState") var followingMenuState = "open"

  var innerBody: some View {
    List {
      Section {
        Button(action: { inboxMenuState = inboxMenuState == "open" ? "closed" : "open" }, label: {
          HStack {
            Image.tabLibrary
            Text("Library")
            Spacer()

            if inboxMenuState == "open" {
              Image(systemName: "chevron.down")
            } else {
              Image(systemName: "chevron.right")
            }
          }
        })

        if inboxMenuState == "open" {
          ForEach(viewModel.filters.filter { $0.folder == "inbox" }, id: \.self) { filter in
            Button(action: {
              viewModel.appliedFilter = filter
              selectedFilter = filter
              followingActive = false
              inboxActive = true
            }, label: {
              HStack {
                Spacer().frame(width: 35)
                Text(filter.name)
                  .lineLimit(1)
              }
            })
              .listRowBackground(
                selectedFilter == filter && inboxActive
                  ? Color.systemBackground.cornerRadius(8) : Color.clear.cornerRadius(8)
              )
          }
        }
      }

      Section {
        Button(action: { followingMenuState = followingMenuState == "open" ? "closed" : "open" }, label: {
          HStack {
            Image.tabFollowing
            Text("Following")
            Spacer()

            if followingMenuState == "open" {
              Image(systemName: "chevron.down")
            } else {
              Image(systemName: "chevron.right")
            }
          }
        })

        if followingMenuState == "open" {
          ForEach(viewModel.filters.filter { $0.folder == "following" }, id: \.self) { filter in
            Button(action: {
              viewModel.appliedFilter = filter
              selectedFilter = filter
              inboxActive = false
              followingActive = true
            }, label: {
              HStack {
                Spacer().frame(width: 35)
                Text(filter.name)
                  .lineLimit(1)
              }
            })
              .listRowBackground(
                selectedFilter == filter && followingActive
                  ? Color.systemBackground.cornerRadius(8) : Color.clear.cornerRadius(8)
              )
          }
        }
      }
      .listStyle(.sidebar)
      .dynamicTypeSize(.small ... .large)
      .sheet(isPresented: $addLinkPresented) {
        NavigationView {
          LibraryAddLinkView()
          #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
          #endif
        }
      }
    }
    .sheet(isPresented: $showProfile) {
      NavigationView {
        ProfileView()
          .toolbar {
            ToolbarItem(placement: .barTrailing) {
              Button(action: { showProfile = false }, label: {
                Text("Close")
                  .bold()
              })
            }
          }
      }
    }.task {
      await viewModel.loadFilters(dataService: dataService)

      if inboxActive {
        selectedFilter = viewModel.appliedFilter
      } else {
        selectedFilter = viewModel.appliedFilter
      }
    }.onChange(of: viewModel.appliedFilter) { filter in
      // When the user uses the dropdown menu to change filter we need to update in the sidebar
      if inboxActive, filter != selectedFilter {
        selectedFilter = filter
      }
    }
  }

  var body: some View {
    #if os(iOS)
      innerBody
        .toolbar {
          ToolbarItem(placement: .barTrailing) {
            Button(action: { showProfile = true }, label: { Image.tabProfile })
          }
        }
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
