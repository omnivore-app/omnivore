import SwiftUI

public struct LoadingSection: View {
  public init() {}

  public var body: some View {
    Section {
      HStack(alignment: .center) {
        Spacer()
        Text("Loading...")
        Spacer()
      }
      .frame(maxWidth: .infinity)
    }
  }
}
