import XCTest

extension XCUIApplication {
  var isDisplayingWelcomeScreen: Bool {
    otherElements["welcomeView"].waitForExistence(timeout: 2)
  }
}
