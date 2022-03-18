import Foundation
import WebKit

public enum WebReaderResources {
  public static var cssScript: WKUserScript {
    WKUserScript(source: css(), injectionTime: .atDocumentEnd, forMainFrameOnly: false)
  }

  public static var bundleURL: URL {
    Bundle.module.bundleURL
  }
}

private func css() -> String {
  guard let path = Bundle.module.path(forResource: "reader", ofType: "css") else { return "" }
  let cssString = (try? String(contentsOfFile: path, encoding: .utf8)) ?? ""
  return """
      javascript:(function() {
      var parent = document.getElementsByTagName('head').item(0);
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = window.atob('\(encodeStringTo64(fromString: cssString))');
      parent.appendChild(style)})()
  """
}

private func encodeStringTo64(fromString: String) -> String {
  let plainData = fromString.data(using: .utf8)
  return plainData?.base64EncodedString(options: []) ?? ""
}
