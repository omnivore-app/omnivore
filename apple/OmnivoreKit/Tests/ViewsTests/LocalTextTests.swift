@testable import Views
import XCTest

final class LocalTextTests: XCTestCase {
  func testThatLocalTextFindsStrings() {
    // Make sure that the same key is not returned when looking up a localized string by key
    // Testing the first and last entry in teh strings file is adequate for finding syntax errors.
    // If any entry is not proper than the key will be returned and the test will fail.

    for languageCode in LanguageCode.allCases {
      XCTAssertNotEqual(languageCode.translation(key: "unitTestLeadingEntry"), "unitTestLeadingEntry")
      XCTAssertNotEqual(languageCode.translation(key: "unitTestTrailingEntry"), "unitTestTrailingEntry")
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
