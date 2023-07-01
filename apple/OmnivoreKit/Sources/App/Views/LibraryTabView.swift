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
  @StateObject private var viewModel = HomeFeedViewModel()

  var body: some View {
    NavigationView {
      ZStack {
        NavigationLink(
          destination: LinkDestination(selectedItem: viewModel.selectedItem),
          isActive: $viewModel.linkIsActive
        ) {
          EmptyView()
        }
        TabView {
          HomeView(viewModel: viewModel)
            .tabItem {
              Label {
                Text("Subscriptions")
              } icon: {
                Image.tabSubscriptions
              }
            }
          HomeView(viewModel: viewModel)
            .tabItem {
              Label {
                Text("Library")
              } icon: {
                Image.tabLibrary
              }
            }
          HomeView(viewModel: viewModel)
            .tabItem {
              Label {
                Text("Highlights")
              } icon: {
                Image.tabHighlights
              }
            }
        }
      }
    }
    .navigationViewStyle(.stack)
  }
}
