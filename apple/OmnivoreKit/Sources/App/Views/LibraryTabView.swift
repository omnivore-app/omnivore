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
import Transmission
import Utils
import Views

@MainActor
struct LibraryTabView: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @AppStorage("LibraryTabView::hideFollowingTab") var hideFollowingTab = false
  @AppStorage(UserDefaultKey.lastSelectedTabItem.rawValue) var selectedTab = "inbox"

  @State var showExpandedAudioPlayer = false

  @MainActor
  public init() {
    UITabBar.appearance().isHidden = true
  }

  @StateObject private var followingViewModel = HomeFeedViewModel(
    folder: "following",
    fetcher: LibraryItemFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: false,
      leadingSwipeActions: [.moveToInbox],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  @StateObject private var libraryViewModel = HomeFeedViewModel(
    folder: "inbox",
    fetcher: LibraryItemFetcher(),
    listConfig: LibraryListConfig(
      hasFeatureCards: true,
      leadingSwipeActions: [.pin],
      trailingSwipeActions: [.archive, .delete],
      cardStyle: .library
    )
  )

  private let syncManager = LibrarySyncManager()

  var body: some View {
    VStack(spacing: 0) {
      TabView(selection: $selectedTab) {
        if !hideFollowingTab {
          NavigationView {
            HomeFeedContainerView(viewModel: followingViewModel)
              .navigationBarTitleDisplayMode(.inline)
              .navigationViewStyle(.stack)
          }.tag("following")
        }

        NavigationView {
          HomeFeedContainerView(viewModel: libraryViewModel)
            .navigationBarTitleDisplayMode(.inline)
            .navigationViewStyle(.stack)
        }.tag("inbox")

        NavigationView {
          ProfileView()
            .navigationViewStyle(.stack)
        }.tag("profile")
      }
      if let audioProperties = audioController.itemAudioProperties {
        MiniPlayerViewer(itemAudioProperties: audioProperties)
          .onTapGesture {
            showExpandedAudioPlayer = true
          }
          .padding(0)
        Color(hex: "#3D3D3D")
          .frame(height: 1)
          .frame(maxWidth: .infinity)
      }
      CustomTabBar(selectedTab: $selectedTab, hideFollowingTab: hideFollowingTab)
        .padding(0)
    }
    .fullScreenCover(isPresented: $showExpandedAudioPlayer) {
      ExpandedAudioPlayer()
    }
    .navigationBarHidden(true)
    .task {
      await syncManager.syncItems(dataService: dataService)
    }
    .onReceive(NSNotification.performSyncPublisher) { _ in
      Task {
        await syncManager.syncItems(dataService: dataService)
      }
    }
  }
}
