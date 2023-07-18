import Foundation
import Services
import Views

extension Snackbar {
  static func show(message: String, undoAction: (() -> Void)? = nil) {
    NSNotification.operationSuccess(message: message, undoAction: undoAction)
  }
}
