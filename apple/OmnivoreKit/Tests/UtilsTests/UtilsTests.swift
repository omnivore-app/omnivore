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
    XCTAssertEqual(normalizeURL("https://omnivore.work/"), "https://omnivore.work")

    // utm_ removed
    // swiftlint:disable:next line_length
    XCTAssertEqual(normalizeURL("https://omnivore.work/?aa=a&bb=b&utm_track=track&cc=c"), "https://omnivore.work?aa=a&bb=b&cc=c")

    // query params sorted
    XCTAssertEqual(normalizeURL("https://omnivore.work/?aa=a&cc=c&bb=b"), "https://omnivore.work?aa=a&bb=b&cc=c")
    XCTAssertEqual(normalizeURL("https://omnivore.work/?cc=c&bb=b&aa=a"), "https://omnivore.work?aa=a&bb=b&cc=c")
  }

  static var allTests = [
    ("testExample", testExample),
    ("testNormalizeUrl", testNormalizeUrl)
  ]
}
