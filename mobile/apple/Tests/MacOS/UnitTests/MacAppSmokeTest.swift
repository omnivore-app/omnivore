import XCTest

final class MacAppSmokeTest: XCTestCase {
  func testExample() throws {
    let isThereSmoke = false
    XCTAssertFalse(isThereSmoke, "Uh oh, there is smoke coming from the macos app")
  }
}
