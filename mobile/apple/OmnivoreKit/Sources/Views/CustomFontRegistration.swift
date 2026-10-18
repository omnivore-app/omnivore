import SwiftUI

@discardableResult
public func registerFonts() -> Bool {
  [
    registerFont(bundle: .module, fontName: "Inter-Black-900", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-ExtraBold-800", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Bold-700", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-SemiBold-600", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Medium-500", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Regular-400", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Light-300", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-ExtraLight-200", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Inter-Thin", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "SFMonoRegular", fontExtension: "otf"),
    registerFont(bundle: .module, fontName: "Merriweather-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Lora-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "OpenSans-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Roboto-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "CrimsonText-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "OpenDyslexicAlta-Regular", fontExtension: "otf"),
    registerFont(bundle: .module, fontName: "Montserrat-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Newsreader-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "AtkinsonHyperlegible-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "SourceSerifPro-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "SourceSansPro-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "IBMPlexSans-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "LXGWWenKai-Regular", fontExtension: "ttf"),
    registerFont(bundle: .module, fontName: "Lexend-Regular", fontExtension: "ttf")
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
