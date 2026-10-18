import Foundation

public extension URL {
  // swiftlint:disable:next identifier_name
  static var om_documentsDirectory: URL {
    if #unavailable(iOS 16, tvOS 16, macOS 13) {
      guard let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
        fatalError("Could not determine the user's documents directory")
      }
      return url
    } else {
      return URL.documentsDirectory
    }
  }

  // swiftlint:disable:next identifier_name
  static var om_cachesDirectory: URL {
    if #unavailable(iOS 16, tvOS 16, macOS 13) {
      guard let url = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else {
        fatalError("Could not determine the user's caches directory")
      }
      return url
    } else {
      return URL.cachesDirectory
    }
  }
}
