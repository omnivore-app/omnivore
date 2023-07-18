//
//  File.swift
//
//
//  Created by Jackson Harper on 7/1/23.
//

import Foundation

enum CardStyle {
  case library
  case highlights
}

struct LibraryListConfig {
  var hasFeatureCards = false
  var leadingSwipeActions = [SwipeAction]()
  var trailingSwipeActions = [SwipeAction]()
  var cardStyle = CardStyle.library
}
