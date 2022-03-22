import Foundation

public extension Bundle {
  var isAppStoreBuild: Bool {
    #if DEBUG
      return false
    #else
      guard let path = appStoreReceiptURL?.path else {
        return true
      }
      return !path.contains("sandboxReceipt")
    #endif
  }
}

// Convenience for locating package resources externally
public enum UtilsPackage {
  public static var bundleURL: URL {
    Bundle.module.bundleURL
  }
}
