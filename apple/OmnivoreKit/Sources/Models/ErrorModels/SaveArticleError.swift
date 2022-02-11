import Foundation

public enum SaveArticleError: Error {
  case unauthorized
  case network
  case badData
  case unknown(description: String)
}
