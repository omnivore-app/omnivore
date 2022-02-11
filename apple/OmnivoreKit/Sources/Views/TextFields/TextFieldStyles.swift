import SwiftUI

struct StandardTextFieldStyle: TextFieldStyle {
  // swiftlint:disable:next identifier_name
  func _body(configuration: TextField<_Label>) -> some View {
    configuration
      .textFieldStyle(PlainTextFieldStyle())
      .multilineTextAlignment(.leading)
      .foregroundColor(.appGrayText)
      .font(.appBody)
      .padding(.vertical, 12)
      .padding(.horizontal, 16)
      .background(border)
  }

  var border: some View {
    RoundedRectangle(cornerRadius: 16)
      .strokeBorder(Color.appGrayBorder, lineWidth: 1)
      .background(RoundedRectangle(cornerRadius: 16).fill(Color.systemBackground))
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
