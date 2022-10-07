//
//  AppStoreScreenshots.swift
//  AppStoreScreenshots
//
//  Created by Jackson Harper on 9/28/22.
//

import XCTest

// swiftlint:disable line_length
final class AppStoreScreenshots: XCTestCase {
  override func setUpWithError() throws {}

  override func tearDownWithError() throws {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
  }

  func testScreenshotLibrary() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
    snapshot("Library")
  }

  func testScreenshotLibraryActions() throws {
    let app = XCUIApplication()
    setupSnapshot(app)

    // Display the context menu of the first item in the libary
    app.collectionViews.cells.firstMatch.press(forDuration: 2)
    snapshot("LibraryActions")

    app.children(matching: .window).element(boundBy: 0).tap()
  }

  func testScreenshotReader() throws {
    let app = XCUIApplication()
    setupSnapshot(app)

    // Move into the reader
    app.collectionViews.cells.firstMatch.tap()
    snapshot("Reader")
  }

  // For this screenshot we manually set the reader position, highlight
  // the text, and then run the test to take the screenshot
  func testScreenshotReaderHighlight() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
    // app.collectionViews.cells.firstMatch.tap()
    snapshot("ReaderHighlight")

    // let webViewsQuery = app.webViews.element.swipeUp()
  }

  // For this screenshot we manually setup the audio player then run the test
  func testScreenshotReaderPlayer() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
//    app.collectionViews.cells.firstMatch.tap()
//    print("BUTTONS:  ", app.buttons.allElementsBoundByIndex.count)
//    app.buttons["Audiobook"].tap()
//
//    print("MINIPLAYER BUTTONS:  ", app.buttons.allElementsBoundByIndex)
//
    snapshot("ReaderTTSPlayer")

    /// app.children(matching: .window).element(boundBy: 0).tap()
    //  XCUIApplication().buttons["Back"].tap()
  }

  func testScreenshotReaderActions() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
    app.collectionViews.cells.firstMatch.tap()
    app.buttons["_profile"].tap()

    snapshot("ReaderActions")

    app.children(matching: .window).element(boundBy: 0).tap()
    XCUIApplication().buttons["Back"].tap()
  }

  func testScreenshotSubscriptions() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
    app.navigationBars["Home"]/*@START_MENU_TOKEN@*/ .buttons["_profile"]/*[[".otherElements[\"_profile\"].buttons[\"_profile\"]",".buttons[\"_profile\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/ .tap()
    app.collectionViews.buttons["Subscriptions"].tap()

    snapshot("Newsletters")

    app.navigationBars["Profile"].buttons["Home"].tap()
  }

  // Manually open Safari and then run the extension and then this test
  func testScreenshotExtension() throws {
    let app = XCUIApplication()
    setupSnapshot(app)
//    app.navigationBars["Home"]/*@START_MENU_TOKEN@*/ .buttons["_profile"]/*[[".otherElements[\"_profile\"].buttons[\"_profile\"]",".buttons[\"_profile\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/ .tap()
//    app.collectionViews.buttons["Subscriptions"].tap()

    snapshot("SaveExtension")

    //   app.navigationBars["Profile"].buttons["Home"].tap()
  }
}
