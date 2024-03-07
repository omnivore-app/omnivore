//
//  LibraryFeatureCardNavigationLink.swift
//
//
//  Created by Jackson Harper on 4/4/23.
//

import Models
import Services
import SwiftUI
import Transmission
import Views

struct LibraryFeatureCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: Models.LibraryItem
  @ObservedObject var viewModel: HomeFeedViewModel

  @State var showFeatureActions = false

  var body: some View {
    Button(action: {
      viewModel.presentItem(item: item)
    }, label: {
      LibraryFeatureCard(item: item, viewer: dataService.currentViewer)
    })
    .buttonStyle(.plain)
    .confirmationDialog("", isPresented: $showFeatureActions) {
      if FeaturedItemFilter(rawValue: viewModel.fetcher.featureFilter) == .pinned {
        Button("Unpin", action: {
          viewModel.unpinItem(dataService: dataService, item: item)
        })
      }
      Button("Pin", action: {
        viewModel.pinItem(dataService: dataService, item: item)
      })
      Button("Archive", action: {
        viewModel.setLinkArchived(dataService: dataService, objectID: item.objectID, archived: true)
      })
      Button("Remove", action: {
        viewModel.removeLibraryItem(dataService: dataService, objectID: item.objectID)
      })
      if FeaturedItemFilter(rawValue: viewModel.fetcher.featureFilter) != .pinned {
        Button("Mark Read", action: {
          viewModel.markRead(dataService: dataService, item: item)
        })
        Button("Mark Unread", action: {
          viewModel.markUnread(dataService: dataService, item: item)
        })
      }
      Button("Dismiss", role: .cancel, action: {
        showFeatureActions = false
      })
    }
    .delayedGesture(LongPressGesture().onEnded { _ in
      showFeatureActions = true
    })
  }
}
