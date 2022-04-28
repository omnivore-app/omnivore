import Foundation

public enum TestEvent {
  case testEventOne
  case testEventTwo(extraData: String)
}

extension TestEvent: TrackableEvent {
  public var name: String {
    switch self {
    case .testEventOne:
      return "testEventOne"
    case .testEventTwo:
      return "testEventTwo"
    }
  }

  public var properties: [String: String]? {
    switch self {
    case .testEventOne:
      return nil
    case let .testEventTwo(extraData: extraData):
      return ["extraData": extraData]
    }
  }
}
