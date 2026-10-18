import SwiftUI

public struct StandardTextFieldStyle: TextFieldStyle {
  let textColor: Color?

  public init(textColor: Color = .appGrayText) {
    self.textColor = textColor
  }

  // swiftlint:disable:next identifier_name
  public func _body(configuration: TextField<_Label>) -> some View {
    configuration
      .textFieldStyle(PlainTextFieldStyle())
      .multilineTextAlignment(.leading)
      .foregroundColor(textColor)
      .font(.appBody)
      .padding(.vertical, 12)
      .padding(.horizontal, 16)
      .background(border)
  }

  public var border: some View {
    RoundedRectangle(cornerRadius: 8)
      .strokeBorder(Color.appGrayBorder, lineWidth: 1)
      .background(RoundedRectangle(cornerRadius: 8).fill(Color.systemBackground))
  }
}

#if os(macOS)
  extension NSTextField {
    override open var focusRingType: NSFocusRingType {
      get { .none }
      // swiftlint:disable:next unused_setter_value
      set {}
    }
  }
#endif
