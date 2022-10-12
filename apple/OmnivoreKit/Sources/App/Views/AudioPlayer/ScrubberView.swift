#if os(iOS)

  import Foundation
  import SwiftUI

  struct ScrubberView: UIViewRepresentable {
    typealias UIViewType = UISlider

    @Binding var value: Double
    var minValue: Double
    var maxValue: Double
    var onEditingChanged: (Bool) -> Void

    init(value: Binding<Double>, minValue: Double, maxValue: Double, onEditingChanged: @escaping (Bool) -> Void) {
      self._value = value
      self.minValue = minValue
      self.maxValue = maxValue
      self.onEditingChanged = onEditingChanged
    }

    func makeUIView(context: Context) -> UISlider {
      let slider = UISlider(frame: .zero)
      slider.maximumValue = Float(minValue)
      slider.maximumValue = Float(maxValue)

      let tintColor = UIColor(Color.appCtaYellow)

      let image = UIImage(systemName: "circle.fill",
                          withConfiguration: UIImage.SymbolConfiguration(scale: .small))?
        .withTintColor(tintColor)
        .withRenderingMode(.alwaysOriginal)

      slider.setThumbImage(image, for: .selected)
      slider.setThumbImage(image, for: .normal)

      slider.minimumTrackTintColor = tintColor
      slider.addTarget(context.coordinator,
                       action: #selector(Coordinator.valueChanged(_:)),
                       for: .valueChanged)

      return slider
    }

    func updateUIView(_ uiView: UISlider, context _: Context) {
      uiView.value = Float(value)
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
