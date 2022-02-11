@testable import Omnivore
import XCTest

final class IOSAppSmokeTest: XCTestCase {
  func testExample() throws {
    let isThereSmoke = false
    XCTAssertFalse(isThereSmoke, "Uh oh, there is smoke coming from the iOS app")
  }
}
