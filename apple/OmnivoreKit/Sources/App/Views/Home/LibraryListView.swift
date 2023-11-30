//
//  File.swift
//
//
//  Created by Jackson Harper on 6/29/23.
//

import Foundation
import Models
import SwiftUI

struct LibraryListView: View {
  @StateObject private var libraryViewModel = HomeFeedViewModel(
    fetcher: LibraryItemFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  var body: some View {
//    ZStack {
//      NavigationLink(
//        destination: LinkDestination(selectedItem: libraryViewModel.selectedItem),
//        isActive: $libraryViewModel.linkIsActive
//      ) {
//        EmptyView()
//      }
    HomeView(viewModel: libraryViewModel)
      .tabItem {
        Label {
          Text("Library")
        } icon: {
          Image.tabLibrary
        }
      }
//    }
  }
}
