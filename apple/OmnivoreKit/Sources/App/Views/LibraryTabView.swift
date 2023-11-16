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

@MainActor
struct LibraryTabView: View {
  @EnvironmentObject var dataService: DataService

  @MainActor
  public init() {
    UITabBar.appearance().isHidden = true
    UITabBar.appearance().backgroundColor = UIColor(Color.themeTabBarColor)
  }

  @StateObject private var followingViewModel = HomeFeedViewModel(
    fetcher: InboxFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: false,
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var libraryViewModel = HomeFeedViewModel(
    fetcher: InboxFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var highlightsViewModel = HomeFeedViewModel(
    fetcher: InboxFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .highlights
    )
  )

  @State var selectedTab = "following"

  var body: some View {
    VStack(spacing: 0) {
      TabView(selection: $selectedTab) {
        NavigationView {
          HomeView(viewModel: followingViewModel)
            .navigationViewStyle(.stack)
        }
        .tag("following")

        NavigationView {
          HomeView(viewModel: libraryViewModel)
            .navigationViewStyle(.stack)
        }
        .tag("inbox")

        NavigationView {
          ProfileView()
            .navigationViewStyle(.stack)
        }
        .tag("profile")
      }
      CustomTabBar(selectedTab: $selectedTab)
    }
    .ignoresSafeArea()
  }
}
