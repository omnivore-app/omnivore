import Foundation

// Convenience for locating package resources externally
public enum ViewsPackage {
  public static var bundleURL: URL {
    Bundle.module.bundleURL
  }
}
