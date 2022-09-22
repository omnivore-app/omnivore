import Foundation

public enum TrackableEvent {
  case linkRead(linkID: String, slug: String, originalArticleURL: String)
  case debugMessage(message: String)
  case backgroundFetch(jobStatus: BackgroundFetchJobStatus, itemCount: Int, secondsElapsed: Int)
  case audioSessionStart(linkID: String)
  case audioSessionEnd(linkID: String, timeElapsed: Double)
}

public enum BackgroundFetchJobStatus: String {
  case success
  case failed
  case authFailure
  case timeExpired
}

public extension TrackableEvent {
  var name: String {
    switch self {
    case .linkRead:
      return "link_read"
    case .debugMessage:
      return "debug_message"
    case .backgroundFetch:
      return "background_fetch"
    case .audioSessionStart:
      return "audio_session_start"
    case .audioSessionEnd:
      return "audio_session_end"
    }
  }

  var properties: [String: String]? {
    switch self {
    case let .linkRead(linkID: linkID, slug: slug, originalArticleURL: originalArticleURL):
      return [
        "link": linkID,
        "slug": slug,
        "url": originalArticleURL
      ]
    case let .debugMessage(message: message):
      return ["message": message]
    case let .backgroundFetch(jobStatus: jobStatus, itemCount: itemCount, secondsElapsed: secondsElapsed):
      return [
        "status": jobStatus.rawValue,
        "seconds_elapsed": String(secondsElapsed),
        "fetched_item_count": String(itemCount)
      ]
    case let .audioSessionStart(linkID: linkID):
      return [
        "link": linkID
      ]
    case let .audioSessionEnd(linkID: linkID, timeElapsed: timeElapsed):
      return [
        "link": linkID,
        "timeElapsed": String(timeElapsed)
      ]
    }
  }
}
