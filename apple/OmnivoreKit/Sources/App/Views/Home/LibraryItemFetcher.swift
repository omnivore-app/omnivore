//
//  File.swift
//
//
//  Created by Jackson Harper on 11/16/23.
//

import Foundation
import Models
import Services
import SwiftUI
import Utils

@MainActor
class FetcherFilterState: ObservableObject {
  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()

  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @AppStorage(UserDefaultKey.lastSelectedLinkedItemFilter.rawValue) var appliedFilterName = "inbox"
  @Published var appliedFilter: InternalFilter? {
    didSet {
      appliedFilterName = appliedFilter?.name.lowercased() ?? "inbox"
    }
  }

  init(appliedFilterName: String) {
    self.appliedFilterName = appliedFilterName
  }
}

@MainActor
protocol LibraryItemFetcher {
  var folder: String { get }

  var items: [Models.LibraryItem] { get }
  var itemsPublisher: Published<[Models.LibraryItem]>.Publisher { get }

  func loadItems(dataService: DataService, filterState: FetcherFilterState, isRefresh: Bool) async
  func loadMoreItems(dataService: DataService, filterState: FetcherFilterState, isRefresh: Bool) async
}
