#if os(iOS)

  import Foundation
  import SwiftUI

  extension UIColor {
    func image(_ size: CGSize = CGSize(width: 1, height: 1)) -> UIImage {
      UIGraphicsImageRenderer(size: size).image { rendererContext in
        self.setFill()
        rendererContext.fill(CGRect(origin: .zero, size: size))
      }
    }
  }

  class CustomSliderView: UISlider {
    @IBInspectable var trackLineHeight: CGFloat = 2

    override func trackRect(forBounds bound: CGRect) -> CGRect {
      CGRect(origin: CGPoint(x: bound.origin.x, y: bound.midY),
             size: CGSize(width: bound.width, height: trackLineHeight))
    }
  }

  struct CustomSlider: UIViewRepresentable {
    typealias UIViewType = UISlider

    @Binding var value: Int

    let minValue: Int
    let maxValue: Int
    var onEditingChanged: (Bool) -> Void

    init(value: Binding<Int>, minValue: Int, maxValue: Int, onEditingChanged: @escaping (Bool) -> Void) {
      self._value = value
      self.minValue = minValue
      self.maxValue = maxValue
      self.onEditingChanged = onEditingChanged
    }

    func asFloat<T: BinaryInteger>(_ numeric: T) -> Float {
      Float(Double(numeric))
    }

    func makeUIView(context: Context) -> UISlider {
      let slider = CustomSliderView(frame: .zero)
      slider.trackLineHeight = 2
      slider.minimumValue = asFloat(minValue)
      slider.maximumValue = asFloat(maxValue)

      let tintColor = UIColor(Color(hex: "#969594") ?? Color.appGrayBorder)
      let thumbImage = UIImage(systemName: "circle.fill",
                               withConfiguration: UIImage.SymbolConfiguration(scale: .medium))?
        .withTintColor(tintColor)
        .withRenderingMode(.alwaysOriginal)

      slider.setThumbImage(thumbImage, for: .selected)
      slider.setThumbImage(thumbImage, for: .normal)

      //   slider.minimumTrackTintColor = tintColor
      slider.addTarget(context.coordinator,
                       action: #selector(Coordinator.valueChanged(_:)),
                       for: .valueChanged)

      return slider
    }

    func updateUIView(_ uiView: UISlider, context _: Context) {
      uiView.value = Float(value)
      uiView.maximumValue = Float(maxValue)
    }

    func makeCoordinator() -> Coordinator {
      let coordinator = Coordinator(value: $value, onEditingChanged: onEditingChanged)
      return coordinator
    }

    class Coordinator: NSObject {
      var value: Binding<Int>
      var onEditingChanged: (Bool) -> Void

      init(value: Binding<Int>, onEditingChanged: @escaping (Bool) -> Void) {
        self.value = value
        self.onEditingChanged = onEditingChanged
        super.init()
      }

      @objc func valueChanged(_ sender: UISlider) {
        let oldValue = value.wrappedValue
        value.wrappedValue = Int(round(sender.value))
        if oldValue != value.wrappedValue {
          onEditingChanged(sender.isTracking)
        }
      }
    }
  }

#endif
