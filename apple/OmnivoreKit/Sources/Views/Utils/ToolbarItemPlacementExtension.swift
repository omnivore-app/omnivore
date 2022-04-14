import SwiftUI

public extension ToolbarItemPlacement {
  static var barLeading: ToolbarItemPlacement {
    #if os(iOS)
      .navigationBarLeading
    #else
      .automatic
    #endif
  }

  static var barTrailing: ToolbarItemPlacement {
    #if os(iOS)
      .navigationBarTrailing
    #else
      .automatic
    #endif
  }
}
