import Foundation
import Services
import Views

extension Snackbar {
  static func show(message: String) {
    NSNotification.operationSuccess(message: message)
  }
}
