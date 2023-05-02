//
//  Theme.swift
//
//
//  Created by Jackson Harper on 10/27/22.
//

import Foundation
import SwiftUI
import Utils

public enum Theme: String, CaseIterable {
  case system = "System"
  case light = "Light"
  case sepia = "Sepia"
  case apollo = "Apollo"
  case dark = "Black"

  public var bgColor: Color {
    switch self {
    case .system:
      return Color.isDarkMode ? .systemBackground : .white
    case .light:
      return .white
    case .dark:
      return Color.black
    case .sepia:
      return Color(hex: "#FBF0D9") ?? Color.white
    case .apollo:
      return Color(hex: "#6A6968") ?? Color.black
    }
  }

  public var keyColor: Color {
    switch self {
    case .light, .sepia:
      return Color(red: 255 / 255.0, green: 210 / 255.0, blue: 52 / 255.0)
    case .dark, .apollo:
      return Color(red: 134 / 255.0, green: 109 / 255.0, blue: 21 / 255.0)
    default:
      return bgColor
    }
  }

  public var keyColor: Color {
    switch self {
    case .light:
      return Color(hex: "#F5F5F5") ?? .white
    case .dark:
      return Color(hex: "#3B3938") ?? .black
    default:
      return bgColor
    }
  }

  public var themeKey: String {
    switch self {
    case .dark:
      return "Black"
    case .light, .sepia, .apollo:
      return rawValue
    case .system:
      return Color.isDarkMode ? "Black" : "Light"
    }
  }

  public var isDark: Bool {
    switch self {
    case .system:
      return Color.isDarkMode
    case .sepia, .light:
      return false
    case .dark, .apollo:
      return true
    }
  }

  public static func fromName(themeName: String) -> Theme? {
    Theme.allCases.first(where: { $0.rawValue == themeName })
  }
}

public enum ThemeManager {
  @AppStorage(UserDefaultKey.themeName.rawValue) public static var currentThemeName = "System"

  public static var currentTheme: Theme {
    Theme(rawValue: currentThemeName) ?? .system
  }

  public static var currentBgColor: Color {
    currentTheme.bgColor
  }

  public static var currentHighlightColor: Color {
    currentTheme.highlightColor
  }
}
