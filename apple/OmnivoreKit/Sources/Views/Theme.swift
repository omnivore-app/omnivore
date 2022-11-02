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
  case charcoal = "Charcoal"
  case mint = "Mint"

  case solarized = "Solarized"

  case light = "Light"
  case dark = "Dark"

  public var bgColor: Color {
    switch self {
    case .system:
      return Color.systemBackground
    case .charcoal:
      return Color(red: 48 / 255.0, green: 48 / 255.0, blue: 48 / 255.0)
    case .sepia:
      return Color(red: 249 / 255.0, green: 241 / 255.0, blue: 220 / 255.0)
    case .mint:
      return Color(red: 202 / 255.0, green: 230 / 255.0, blue: 208 / 255.0)
    case .solarized:
      return Color(red: 13 / 255.0, green: 39 / 255.0, blue: 50 / 255.0)
    case .light:
      return Color.white
    case .dark:
      return Color.black
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
}

public enum ThemeManager {
  @AppStorage(UserDefaultKey.themeName.rawValue) public static var currentThemeName = "System"
}
