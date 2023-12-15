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
    PresentationLink(
      transition: PresentationLinkTransition.slide(
        options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                   options:
                                                                   PresentationLinkTransition.Options(
                                                                     modalPresentationCapturesStatusBarAppearance: true
                                                                   ))),
      destination: {
        LinkItemDetailView(
          linkedItemObjectID: item.objectID,
          isPDF: item.isPDF
        )
        .background(ThemeManager.currentBgColor)
      }, label: {
        LibraryFeatureCard(item: item, viewer: dataService.currentViewer)
      }
    )
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
