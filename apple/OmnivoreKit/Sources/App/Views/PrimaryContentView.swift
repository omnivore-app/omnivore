import Models
import Services
import SwiftUI
import Views

@MainActor public struct PrimaryContentView: View {
  @State var searchTerm: String = ""

  public var body: some View {
    innerBody
  }

  public var innerBody: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        return AnyView(
          LibrarySplitView()
        )
      } else {
        return AnyView(
          LibraryTabView()
        )
      }
    #else
      return AnyView(splitView)
    #endif
  }
}
