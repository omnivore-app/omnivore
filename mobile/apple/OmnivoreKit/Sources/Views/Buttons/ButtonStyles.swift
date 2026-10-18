import SwiftUI

public struct SolidCapsuleButtonStyle: ButtonStyle {
  let backgroundColor: Color
  let textColor: Color
  let width: CGFloat

  public init(color: Color = .blue, textColor: Color = .appGrayTextContrast, width: CGFloat = 220) {
    self.backgroundColor = color
    self.textColor = textColor
    self.width = width
  }

  public func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.appHeadline)
      .foregroundColor(textColor)
      .padding(12)
      .frame(width: width)
      .background(backgroundColor)
      .opacity(configuration.isPressed ? 0.7 : 1.0)
      .cornerRadius(8)
      .overlay(
        RoundedRectangle(cornerRadius: 8)
          .stroke(backgroundColor, lineWidth: 1)
      )
  }
}

public struct RoundedRectButtonStyle: ButtonStyle {
  let backgroundColor: Color
  let textColor: Color

  public init(color: Color = .appButtonBackground, textColor: Color = .appGrayTextContrast) {
    self.backgroundColor = color
    self.textColor = textColor
  }

  public func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.appBody)
      .foregroundColor(textColor)
      .padding(10)
      .background(Rectangle().foregroundColor(backgroundColor))
      .opacity(configuration.isPressed ? 0.7 : 1.0)
      .cornerRadius(8)
  }
}

public struct RectButtonStyle: ButtonStyle {
  let backgroundColor: Color
  let textColor: Color

  public init(color: Color = .appButtonBackground, textColor: Color = .appGrayText) {
    self.backgroundColor = color
    self.textColor = textColor
  }

  public func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.appBody)
      .foregroundColor(textColor)
      .padding(10)
      .background(
        Rectangle()
          .foregroundColor(backgroundColor)
          .cornerRadius(0)
      )
      .opacity(configuration.isPressed ? 0.7 : 1.0)
  }
}

struct BorderedButton: View {
  let color: Color
  let text: String
  let action: () -> Void

  var body: some View {
    Button(
      action: action,
      label: {
        HStack {
          Text(" ")
          Spacer()
          Text(text)
          Spacer()
          Text(" ")
        }
        .frame(maxWidth: .infinity)
      }
    )
    .buttonStyle(BorderedButtonStyle(color: color))
  }
}

struct BorderedButtonStyle: ButtonStyle {
  var color: Color

  init(color: Color) {
    self.color = color
  }

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.appBody)
      .foregroundColor(color)
      .padding(10)
      .overlay(
        RoundedRectangle(cornerRadius: 8.0)
          .stroke(lineWidth: 1)
          .foregroundColor(color)
      )
      .opacity(configuration.isPressed ? 0.7 : 1.0)
  }
}

#if DEBUG
  struct CapsuleButtonStylePreview: PreviewProvider {
    static var previews: some View {
      registerFonts()

      return
        VStack {
          Button(
            action: { print("button tapped") },
            label: { Text("Solid Capsule Button") }
          )
          .buttonStyle(SolidCapsuleButtonStyle(width: 220))

          Button(
            action: { print("button tapped") },
            label: { Text("Rounded Rect Button") }
          )
          .buttonStyle(RoundedRectButtonStyle())
        }
    }
  }
#endif
