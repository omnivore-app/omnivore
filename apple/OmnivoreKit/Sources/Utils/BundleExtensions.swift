import Foundation

public extension Bundle {
  /// If it's not a debug build and not TF then it's probably
  var isAppStoreBuild: Bool {
    #if DEBUG
      return false
    #else
      return !isTestFlightBuild
    #endif
  }
  
  private var isTestFlightBuild: Bool {
    appStoreReceiptURL?.path.contains("sandboxReceipt") == true
  }
}

// Convenience for locating package resources externally
public enum UtilsPackage {
  public static var bundleURL: URL {
    Bundle.module.bundleURL
  }
}
