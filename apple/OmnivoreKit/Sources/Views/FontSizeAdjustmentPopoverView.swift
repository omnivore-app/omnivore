import SwiftUI
import Utils

public struct FontSizeAdjustmentPopoverView: View {
  let increaseFontAction: () -> Void
  let decreaseFontAction: () -> Void

  public init(
    increaseFontAction: @escaping () -> Void,
    decreaseFontAction: @escaping () -> Void
  ) {
    self.increaseFontAction = increaseFontAction
    self.decreaseFontAction = decreaseFontAction
  }

  static let preferredWebFontSizeKey = UserDefaultKey.preferredWebFontSize.rawValue
  #if os(macOS)
    @AppStorage(preferredWebFontSizeKey) var storedFontSize = Int(NSFont.userFont(ofSize: 16)?.pointSize ?? 16)
  #else
    @AppStorage(preferredWebFontSizeKey) var storedFontSize: Int = UITraitCollection.current.preferredWebFontSize
  #endif

  public var body: some View {
    HStack(alignment: .center, spacing: 0) {
      Button(
        action: {
          storedFontSize = max(storedFontSize - 2, 10)
          decreaseFontAction()
        },
        label: {
          Image(systemName: "minus")
          #if os(iOS)
            .foregroundColor(.appGraySolid)
            .padding()
          #endif
        }
      )
      .frame(width: 55, height: 40, alignment: .center)
      Divider().frame(height: 30)
      Button(
        action: {
          storedFontSize = min(storedFontSize + 2, 28)
          increaseFontAction()
        },
        label: {
          Image(systemName: "plus")
          #if os(iOS)
            .foregroundColor(.appGraySolid)
            .padding()
          #endif
        }
      )
      .frame(width: 55, height: 40, alignment: .center)
    }
  }
}
