import SwiftUI

// Mostly from: https://kavsoft.dev/swiftui_3.0_marquee_text_animation with some customizations

struct Marquee: View {
  var text: String
  var font: UIFont

  // Storing Text Size
  @State var storedSize: CGSize = .zero
  @State var offset: CGFloat = 0
  @State var animatedText: String = ""

  var animationSpeed: Double = 0.03
  var delayTime: Double = 3.0

  var body: some View {
    // Since it scrolls horizontal using ScrollView
    GeometryReader { proxy in

      let size = proxy.size

      let condition = textSize(text: text).width < (size.width - 50)

      ScrollView(condition ? .init() : .horizontal, showsIndicators: false) {
        HStack(alignment: .center) {
          Spacer(minLength: 0)
          Text(condition ? text : animatedText)
            .font(Font(font))
            .offset(x: condition ? 0 : offset)
            .padding(.horizontal, 15)
          Spacer(minLength: 0)
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }
    .frame(height: storedSize.height)
    .overlay(content: {
      HStack {
        let color: Color = .systemBackground

        LinearGradient(colors: [color, color.opacity(0.7), color.opacity(0.5), color.opacity(0.3)], startPoint: .leading, endPoint: .trailing)
          .frame(width: 8)

        Spacer()

        LinearGradient(colors: [color, color.opacity(0.7), color.opacity(0.5), color.opacity(0.3)].reversed(), startPoint: .leading, endPoint: .trailing)
          .frame(width: 8)
      }
    })
    .disabled(true)
    .onAppear {
      startAnimation(text: text)
    }
    .onReceive(Timer.publish(every: (animationSpeed * storedSize.width) + delayTime,
                             on: .main,
                             in: .default).autoconnect()
    ) { _ in
      offset = 0
      withAnimation(.linear(duration: animationSpeed * storedSize.width).delay(delayTime)) {
        offset = -storedSize.width
      }
    }
    .onChange(of: text) { newValue in
      animatedText = ""
      offset = 0
      startAnimation(text: newValue)
    }
  }

  func startAnimation(text: String) {
    // Double the text with some spacing so that we can create a continuous loop
    animatedText.append(text)
    (1 ... 15).forEach { _ in
      animatedText.append(" ")
    }
    storedSize = textSize(text: animatedText)
    animatedText.append(text)

    let timing: Double = (animationSpeed * storedSize.width)
    withAnimation(.linear(duration: timing).delay(delayTime)) {
      offset = -storedSize.width
    }
  }

  func textSize(text: String) -> CGSize {
    let attributes = [NSAttributedString.Key.font: font]

    let size = (text as NSString).size(withAttributes: attributes)

    return size
  }
}

// Old version:
//
// struct MarqueTextView: View {
//  let font: Font
//
//  @State var text: String
//  @State private var intrinsicSize: CGSize = .zero
//  @State private var truncatedSize: CGSize = .zero
//
//  @State private var shouldAnimate: Bool = false
//  @State private var animationOffset: Double = 0.0
//
//  var body: some View {
//    GeometryReader { geo in
//      ScrollView(.horizontal, showsIndicators: false) {
//        HStack(alignment: .center) {
//          Spacer(minLength: 0)
//          Text(text)
//            .font(font)
//            .lineLimit(1)
//            .lineSpacing(1.25)
//            .offset(x: animationOffset)
//            .readSize { size in
//              truncatedSize = size
//              intrinsicSize = geo.size
//
//              shouldAnimate = textSize().width > intrinsicSize.width
//            }
//          Spacer(minLength: 0)
//        }
//        .frame(width: max(geo.size.width, textSize().width + 10))
//      }
//      .frame(maxWidth: .infinity, alignment: .center)
//      .disabled(true)
//      .onChange(of: shouldAnimate) { _ in
//
//        let baseText = text
//        text.append("                ")
//        let initialSize = textSize()
//
//        print("starting animation, truncatedSize: ", truncatedSize, "geo width: ", geo.size)
//        if shouldAnimate {
//          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(500)) {
//            withAnimation(.linear(duration: 0.05 * truncatedSize.width)) {
//              animationOffset = -truncatedSize.width
//            }
//          }
//        }
//      }
//      .onReceive(Timer.publish(every: 0.05 * truncatedSize.width + 0.5, on: .main, in: .default).autoconnect()) { _ in
//        if shouldAnimate {
//          animationOffset = 0
//          withAnimation(.linear(duration: 0.05 * truncatedSize.width)) {
//            animationOffset = -truncatedSize.width
//          }
//        }
//      }
//    }
//  }
//
//  func textSize() -> CGSize {
//    let attributes = [NSAttributedString.Key.font: UIFont(name: "Inter-Regular", size: 16)!]
//    return (text as NSString).size(withAttributes: attributes)
//  }
// }
//
////    text()
////      .lineLimit(lineLimit)
////      .offset(x: animationOffset)
////      .readSize { size in
////        truncatedSize = size
////        shouldAnimate = truncatedSize != intrinsicSize
////        print("trunvatedSize: ", truncatedSize, "intrinsicSize: ", intrinsicSize)
////      }
////      .background(
////        text()
////          .fixedSize(horizontal: false, vertical: true)
////          .hidden()
////          .readSize { size in
////            intrinsicSize = size
////            shouldAnimate = truncatedSize != intrinsicSize
////          }
////      )
////      .onChange(of: shouldAnimate, perform: { _ in
////        print("starting animation")
////        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(500)) {
////          withAnimation(.linear(duration: 0.2 * intrinsicSize.width)) {
////            animationOffset = intrinsicSize.width
////          }
////        }
////      })
////  }
//// }
//
// extension View {
//  func readSize(onChange: @escaping (CGSize) -> Void) -> some View {
//    background(
//      GeometryReader { geometryProxy in
//        Color.clear
//          .preference(key: SizePreferenceKey.self, value: geometryProxy.size)
//      }
//    )
//    .onPreferenceChange(SizePreferenceKey.self, perform: onChange)
//  }
// }
//
// struct SizePreferenceKey: PreferenceKey {
//  static var defaultValue: CGSize = .zero
//  static func reduce(value _: inout CGSize, nextValue _: () -> CGSize) {}
// }
