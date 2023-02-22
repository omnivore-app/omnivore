@testable import Views
import XCTest

final class SnoozeTests: XCTestCase {
  func parse(_ str: String) -> Date {
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX") // set locale to reliable US_POSIX
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    return dateFormatter.date(from: str)!
  }

  func test_weekdayBefore8PM_minus8() {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: -8 * 3600)!
    let now = parse("2022-01-31T10:11:12-08:00")
    let snoozes = Snooze.calculateValues(for: now, calendar: calendar)

    XCTAssertEqual(snoozes[0].until, parse("2022-01-31T20:00:00-08:00"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T08:00:00-08:00"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00-08:00"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00-08:00"))
  }

  func test_weekdayBefore8PM_zulu() {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 0)!
    let now = parse("2022-01-31T13:14:15Z")
    let snoozes = Snooze.calculateValues(for: now, calendar: calendar)

    XCTAssertEqual(snoozes[0].until, parse("2022-01-31T20:00:00Z"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T08:00:00Z"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00Z"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00Z"))
  }

  func test_weekdayAfter8PM_minus8() {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: -8 * 3600)!
    let now = parse("2022-01-31T20:11:12-08:00")
    let snoozes = Snooze.calculateValues(for: now, calendar: calendar)

    XCTAssertEqual(snoozes[0].until, parse("2022-02-01T08:00:00-08:00"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T20:00:00-08:00"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00-08:00"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00-08:00"))
  }

  func test_weekdayAfter8PM_plus5() {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 5 * 3600)!
    let now = parse("2022-01-31T22:33:44+05:00")
    let snoozes = Snooze.calculateValues(for: now, calendar: calendar)

    XCTAssertEqual(snoozes[0].until, parse("2022-02-01T08:00:00+05:00"))
    XCTAssertEqual(snoozes[1].until, parse("2022-02-01T20:00:00+05:00"))
    XCTAssertEqual(snoozes[2].until, parse("2022-02-05T08:00:00+05:00"))
    XCTAssertEqual(snoozes[3].until, parse("2022-02-07T08:00:00+05:00"))
  }

  static var allTests = [
    ("test_weekdayBefore8PM_minus8", test_weekdayBefore8PM_minus8),
    ("test_weekdayBefore8PM_zulu", test_weekdayBefore8PM_zulu),
    ("test_weekdayAfter8PM_minus8", test_weekdayAfter8PM_minus8),
    ("test_weekdayAfter8PM_plus5", test_weekdayAfter8PM_plus5)
  ]
}
