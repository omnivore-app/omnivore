//
//  File.swift
//
//
//  Created by Jackson Harper on 6/29/23.
//

import Foundation
import Models
import PopupView
import Services
import SwiftUI
import Views

struct LibraryTabView: View {
  @EnvironmentObject var dataService: DataService

  @StateObject private var subViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: false,
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var libraryViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var highlightsViewModel = HomeFeedViewModel(
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .highlights
    )
  )

  var body: some View {
    if #available(iOS 16.0, *) {
      NavigationView {
        HomeView(viewModel: libraryViewModel)
          .navigationBarHidden(false)
      }
    } else {
      // Fallback on earlier versions
      EmptyView()
    }
  }
}
