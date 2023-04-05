//
//  LibraryFeatureCardNavigationLink.swift
//
//
//  Created by Jackson Harper on 4/4/23.
//

import Models
import Services
import SwiftUI
import Views

struct LibraryFeatureCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: LinkedItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      Button {
        viewModel.selectedItem = item
        viewModel.linkIsActive = true
      } label: {
        NavigationLink(destination: EmptyView()) {
          EmptyView()
        }
        .opacity(0)
        .buttonStyle(PlainButtonStyle())
        .onAppear {
          Task { await viewModel.itemAppeared(item: item, dataService: dataService) }
        }
        LibraryFeatureCard(item: item, viewer: dataService.currentViewer)
      }
    }
  }
}
