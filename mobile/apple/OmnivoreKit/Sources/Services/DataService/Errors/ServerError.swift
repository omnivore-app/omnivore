import Foundation
import Models

public enum CoreDataError: Error {
  case general
}

public enum ServerError: String, Error {
  case noConnection
  case unauthenticated
  case timeout
  case unknown
  case stillProcessing
  case pendingEmailVerification
}

extension ServerError {
  init(serverResponse: ServerResponse) {
    switch serverResponse.httpUrlResponse?.statusCode {
    case 418?:
      self = .pendingEmailVerification
      return
    case 401?, 403?:
      self = .unauthenticated
      return
    case 202:
      self = .stillProcessing
    default:
      break
    }

    switch serverResponse.urlError?.code {
    case .some(.timedOut):
      self = .timeout
      return
    case .some(.notConnectedToInternet):
      self = .noConnection
      return
    default:
      break
    }

    self = .unknown
  }
}
