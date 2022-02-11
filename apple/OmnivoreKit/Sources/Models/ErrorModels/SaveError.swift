import Foundation

public enum SaveError: Error {
  case network
  case unauthorized
  case unknown(description: String)
}
