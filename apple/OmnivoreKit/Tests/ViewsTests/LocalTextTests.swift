@testable import Views
import XCTest

final class LocalTextTests: XCTestCase {
  func testThatLocalTextFindsStrings() {
    // Make sure that the same key is not returned when looking up a localized string by key
    // Testing the first and last entry in teh strings file is adequate for finding syntax errors.
    // If any entry is not proper than the key will be returned and the test will fail.

    // English (test default)
    XCTAssertNotEqual(LocalText.saveArticleSavedState, "saveArticleSavedState")
    XCTAssertNotEqual(LocalText.errorNetwork, "errorNetwork")

    // Simple Chinese
    XCTAssertNotEqual(simpleChineseText(key: "saveArticleSavedState"), "saveArticleSavedState")
    XCTAssertNotEqual(simpleChineseText(key: "errorNetwork"), "errorNetwork")
  }

  private func simpleChineseText(key: String) -> String {
    guard
      let bundlePath = Bundle.module.path(forResource: "zh-Hans", ofType: "lproj"),
      let bundle = Bundle(path: bundlePath)
    else { return key }

    return NSLocalizedString(key, bundle: bundle, comment: "")
  }

  static var allTests = [
    ("testThatLocalTextFindsStrings", testThatLocalTextFindsStrings)
  ]
}
