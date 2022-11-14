//
//  File.swift
//
//
//  Created by Jackson Harper on 10/27/22.
//

import Foundation
import SwiftUI
import Utils

public enum Theme: String, CaseIterable {
  case system = "System"
  case sepia = "Sepia"

  public var bgColor: Color {
    switch self {
    case .system:
      return Color.systemBackground
    case .sepia:
      return Color(red: 250 / 255.0, green: 245 / 255.0, blue: 233 / 255.0)
    }
  }

  public var fgColor: Color {
    switch self {
    case .system:
      return Color.appGrayTextContrast
    case .sepia:
      return Color(red: 57 / 255.0, green: 44 / 255.0, blue: 46 / 255.0)
    }
  }

  public static func fromName(themeName: String) -> Theme? {
    for theme in Theme.allCases {
      if theme.rawValue == themeName {
        return theme
      }
    }
    return nil
  }

  public static var current: Theme {
    if let theme = fromName(themeName: ThemeManager.currentThemeName) {
      return theme
    }
    return .system
  }

  public static var currentBg: Color {
    current.bgColor
  }
}

public enum ThemeManager {
  @AppStorage(UserDefaultKey.themeName.rawValue) public static var currentThemeName = "System"
}
