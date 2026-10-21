@testable import Views
import XCTest

final class LocalTextTests: XCTestCase {
  func testThatLocalTextFindsStrings() {
    // Make sure that the same key is not returned when looking up a localized string by key
    // Testing the first and last entry in the strings file is adequate for finding syntax errors.
    // If any entry is not proper than the key will be returned and the test will fail.

    for languageCode in LanguageCode.allCases {
      // swiftlint:disable line_length
      XCTAssertNotEqual(languageCode.translation(key: "unitTestLeadingEntry"), "unitTestLeadingEntry", "Got untranslated value for unitTestLeadingEntry in \(languageCode)")
      XCTAssertNotEqual(languageCode.translation(key: "unitTestTrailingEntry"), "unitTestTrailingEntry", "Got untranslated value for unitTestTrailingEntry in \(languageCode)")
      // swiftlint:enable line_length
    }
  }

  static var allTests = [
    ("testThatLocalTextFindsStrings", testThatLocalTextFindsStrings)
  ]
}

private enum LanguageCode: String, CaseIterable {
  case english = "en"
  case simpleChinese = "zh-Hans"
  case spanish = "es"

  func translation(key: String) -> String {
    guard
      let bundlePath = Bundle.module.path(forResource: rawValue, ofType: "lproj"),
      let bundle = Bundle(path: bundlePath)
    else { return key }

    return NSLocalizedString(key, bundle: bundle, comment: "")
  }
}
