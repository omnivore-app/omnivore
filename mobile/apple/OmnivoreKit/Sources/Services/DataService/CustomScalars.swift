import Foundation
import SwiftGraphQL

struct DateTime: Codec {
  private var data: Date?

  init(from date: Date) {
    self.data = date
  }

  // MARK: - Public interface

  var value: Date? {
    data
  }

  // MARK: - Codec conformance

  // MARK: - Decoder

  init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()
    let dateString = try container.decode(String.self)

    let formatter = DateFormatter.formatterISO8601

    self.data = formatter.date(from: dateString)
  }

  // MARK: - Encoder

  func encode(to encoder: Encoder) throws {
    var container = encoder.singleValueContainer()
    if let data = data {
      try container.encode(DateFormatter.formatterISO8601.string(from: data))
    } else {
      throw EncodingError.invalidValue(
        data as Any, .init(codingPath: [], debugDescription: "trying to encodea DateTime value")
      )
    }
  }

  // MARK: - Mock value

  static var mockValue = DateTime(from: Date())
}

public extension DateFormatter {
  static let formatterISO8601: DateFormatter = {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .iso8601)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone(secondsFromGMT: 0)
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    return formatter
  }()
}
