//
//  File.swift
//
//
//  Created by Jackson Harper on 6/29/23.
//

import Foundation
import Models
import SwiftUI

struct LibraryTabView: View {
  @StateObject private var subViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: false,
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.delete, .archive],
      cardStyle: .library
    )
  )

  @StateObject private var libraryViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.delete, .archive],
      cardStyle: .library
    )
  )

  @StateObject private var highlightsViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.delete, .archive],
      cardStyle: .highlights
    )
  )

  var body: some View {
    NavigationView {
      ZStack {
        NavigationLink(
          destination: LinkDestination(selectedItem: libraryViewModel.selectedItem),
          isActive: $libraryViewModel.linkIsActive
        ) {
          EmptyView()
        }
        TabView {
//          HomeView(viewModel: subViewModel)
//            .tabItem {
//              Label {
//                Text("Subscriptions")
//              } icon: {
//                Image.tabSubscriptions
//              }
//            }
          HomeView(viewModel: libraryViewModel)
            .tabItem {
              Label {
                Text("Library")
              } icon: {
                Image.tabLibrary
              }
            }
          HomeView(viewModel: highlightsViewModel)
            .tabItem {
              Label {
                Text("Highlights")
              } icon: {
                Image.tabHighlights
              }
            }
        }.ignoresSafeArea()
      }
    }
    .navigationViewStyle(.stack)
  }
}
