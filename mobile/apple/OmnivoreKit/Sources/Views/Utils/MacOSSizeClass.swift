import SwiftUI

#if os(iOS)
  let isMacApp = false
#elseif os(macOS)
  let isMacApp = true
#endif

// https://stackoverflow.com/questions/63526478/swiftui-userinterfacesizeclass-for-universal-macos-ios-views
#if os(macOS)
//  public enum UserInterfaceSizeClass {
//    case compact
//    case regular
//  }

  public struct HorizontalSizeClassEnvironmentKey: EnvironmentKey {
    public static let defaultValue: UserInterfaceSizeClass = .regular
  }

  public struct VerticalSizeClassEnvironmentKey: EnvironmentKey {
    public static let defaultValue: UserInterfaceSizeClass = .regular
  }

  public extension EnvironmentValues {
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
