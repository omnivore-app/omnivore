import Foundation
import SwiftUI

#if DEBUG
  public let isDebug = true
#else
  public let isDebug = false
#endif

public struct FeatureFlags {
  @AppStorage("FeatureFlag::digestEnabled")
  public var digestEnabled = false

  @AppStorage("FeatureFlag::explainEnabled")
  public var explainEnabled = false
  
  public init() {
  }
}
