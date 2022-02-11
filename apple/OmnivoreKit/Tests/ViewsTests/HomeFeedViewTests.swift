@testable import Views
import XCTest

final class HomeFeedViewTests: XCTestCase {
  func parse(_ str: String) -> Date {
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX") // set locale to reliable US_POSIX
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    return dateFormatter.date(from: str)!
  }

  func test_weekdayBefore8PM() {
    let now = parse("2022-01-31T10:11:12-08:00")
    let snoozes = HomeFeedView.snoozeValuesForDate(now: now)

    XCTAssertEqual(snoozes[0].until, parse("2022-01-31T20:00:00-08:00"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T08:00:00-08:00"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00-08:00"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00-08:00"))
  }

  func test_weekdayAfter8PM() {
    let now = parse("2022-01-31T20:11:12-08:00")
    let snoozes = HomeFeedView.snoozeValuesForDate(now: now)

    XCTAssertEqual(snoozes[0].until, parse("2022-02-01T08:00:00-08:00"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T20:00:00-08:00"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00-08:00"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00-08:00"))
  }

  static var allTests = [
    ("test_weekdayBefore8PM", test_weekdayBefore8PM),
    ("test_weekdayAfter8PM", test_weekdayAfter8PM)
  ]
}
