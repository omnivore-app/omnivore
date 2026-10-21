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

  struct ScrubberView: UIViewRepresentable {
    typealias UIViewType = UISlider

    @Binding var value: Double
    @Binding var maxValue: Double
    var onEditingChanged: (Bool) -> Void

    init(value: Binding<Double>, maxValue: Binding<Double>, onEditingChanged: @escaping (Bool) -> Void) {
      self._value = value
      self._maxValue = maxValue
      self.onEditingChanged = onEditingChanged
    }

    func makeUIView(context: Context) -> UISlider {
      let slider = UISlider(frame: .zero)
      slider.minimumValue = Float(0.0)
      slider.maximumValue = Float(maxValue)

      let tintColor = UIColor(Color.appCtaYellow)
      let thumbImage = UIImage(systemName: "circle.fill",
                               withConfiguration: UIImage.SymbolConfiguration(scale: .medium))?
        .withTintColor(tintColor)
        .withRenderingMode(.alwaysOriginal)

      slider.setThumbImage(thumbImage, for: .selected)
      slider.setThumbImage(thumbImage, for: .normal)

      slider.minimumTrackTintColor = tintColor
      slider.addTarget(context.coordinator,
                       action: #selector(Coordinator.valueChanged(_:)),
                       for: .valueChanged)

//      let minImage = UIColor(Color.themeMediumGray).image(CGSize(width: 1, height: 5))
//      let maxImage = UIColor(Color.themeLightGray).image(CGSize(width: 1, height: 5))
//
//      slider.setMinimumTrackImage(minImage, for: .normal)
//      slider.setMaximumTrackImage(maxImage, for: .normal)

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
      var value: Binding<Double>
      var onEditingChanged: (Bool) -> Void

      init(value: Binding<Double>, onEditingChanged: @escaping (Bool) -> Void) {
        self.value = value
        self.onEditingChanged = onEditingChanged
        super.init()
      }

      @objc func valueChanged(_ sender: UISlider) {
        value.wrappedValue = Double(sender.value)
        onEditingChanged(sender.isTracking)
      }
    }
  }

#endif
