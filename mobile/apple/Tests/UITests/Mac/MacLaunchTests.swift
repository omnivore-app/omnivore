import XCTest

class MacUILaunchTest: XCTestCase {
  var app: XCUIApplication!

  override func setUpWithError() throws {
    try super.setUpWithError()
    continueAfterFailure = false
    app = XCUIApplication()
    app.launchArguments.append("--uitesting")
    app.launch()
  }

  func testThatWelcomeScreenDisplaysForLoggedOutUser() {
    XCTAssertTrue(app.isDisplayingWelcomeScreen)
  }

  func testLaunchPerformance() throws {
    measure(metrics: [XCTApplicationLaunchMetric()]) {
      XCUIApplication().launch()
    }
  }
}
