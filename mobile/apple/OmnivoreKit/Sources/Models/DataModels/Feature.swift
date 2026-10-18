import SwiftUI

public struct FeatureInternal {
  public let name: String
  public let enabled: Bool

  public init(name: String, enabled: Bool) {
    self.name = name
    self.enabled = enabled
  }
}
