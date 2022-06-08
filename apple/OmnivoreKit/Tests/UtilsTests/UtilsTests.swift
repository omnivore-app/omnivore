@testable import Utils
import XCTest

final class UtilsTests: XCTestCase {
  func testExample() {
    // This is an example of a functional test case.
    // Use XCTAssert and related functions to verify your tests produce the correct
    // results.
    XCTAssertEqual("Hello", "Hello")
  }

  func testNormalizeUrl() {
    // trailing slash removed
    XCTAssertEqual(normalizeURL("https://omnivore.app/"), "https://omnivore.app")

    // utm_ removed
    XCTAssertEqual(normalizeURL("https://omnivore.app/?aa=a&bb=b&utm_track=track&cc=c"), "https://omnivore.app?aa=a&bb=b&cc=c")

    // query params sorted
    XCTAssertEqual(normalizeURL("https://omnivore.app/?aa=a&cc=c&bb=b"), "https://omnivore.app?aa=a&bb=b&cc=c")
    XCTAssertEqual(normalizeURL("https://omnivore.app/?cc=c&bb=b&aa=a"), "https://omnivore.app?aa=a&bb=b&cc=c")
  }

  static var allTests = [
    ("testExample", testExample),
    ("testNormalizeUrl", testNormalizeUrl)
  ]
}
