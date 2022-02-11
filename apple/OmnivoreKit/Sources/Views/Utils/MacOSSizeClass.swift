import SwiftUI

#if os(iOS)
  let isMacApp = false
#elseif os(macOS)
  let isMacApp = true
#endif

// https://stackoverflow.com/questions/63526478/swiftui-userinterfacesizeclass-for-universal-macos-ios-views
#if os(macOS)
  enum UserInterfaceSizeClass {
    case compact
    case regular
  }

  struct HorizontalSizeClassEnvironmentKey: EnvironmentKey {
    static let defaultValue: UserInterfaceSizeClass = .regular
  }

  struct VerticalSizeClassEnvironmentKey: EnvironmentKey {
    static let defaultValue: UserInterfaceSizeClass = .regular
  }

  extension EnvironmentValues {
    var horizontalSizeClass: UserInterfaceSizeClass {
      get { self[HorizontalSizeClassEnvironmentKey.self] }
      set { self[HorizontalSizeClassEnvironmentKey.self] = newValue }
    }

    var verticalSizeClass: UserInterfaceSizeClass {
      get { self[VerticalSizeClassEnvironmentKey.self] }
      set { self[VerticalSizeClassEnvironmentKey.self] = newValue }
    }
  }
#endif
