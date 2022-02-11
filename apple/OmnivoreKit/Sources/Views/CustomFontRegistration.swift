import SwiftUI

@discardableResult
public func registerFonts() -> Bool {
  [
    registerFont(bundle: .module, fontName: "Inter-Black", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-ExtraBold", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Bold", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-SemiBold", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Medium", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Light", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-ExtraLight", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Thin", fontExtension: "ttf")
  ]
  .allSatisfy { $0 }
}

private func registerFont(bundle: Bundle, fontName: String, fontExtension: String) -> Bool {
  guard let fontURL = bundle.url(forResource: fontName, withExtension: fontExtension) else {
    return false
  }

  guard let fontDataProvider = CGDataProvider(url: fontURL as CFURL) else {
    return false
  }

  guard let font = CGFont(fontDataProvider) else {
    return false
  }

  var error: Unmanaged<CFError>?

  guard CTFontManagerRegisterGraphicsFont(font, &error) else {
    print(
      """
      Error registering font: \(fontName). Maybe it was already registered.\
      \(error.map { " \($0.takeUnretainedValue().localizedDescription)" } ?? "")
      """
    )
    return true
  }

  return true
}
