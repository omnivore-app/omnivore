//
//  File.swift
//
//
//  Created by Jackson Harper on 6/29/23.
//

import Foundation
import SwiftUI

struct LibraryTabView: View {
//  @EnvironmentObject var authenticator: Authenticator
//  @EnvironmentObject var dataService: DataService
//  @Binding var selectedEnvironment: AppEnvironment

//  let appEnvironments: [AppEnvironment] = [.local, .demo, .prod]

  var body: some View {
    TabView {
      HomeView()
        .tabItem {
          Label {
            Text("Subscriptions")
          } icon: {
            Image.tabSubscriptions
          }
        }
      HomeView()
        .tabItem {
          Label {
            Text("Library")
          } icon: {
            Image.tabLibrary
          }
        }
      HomeView()
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
