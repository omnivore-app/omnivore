import Foundation
import Services
import Views

extension Snackbar {
  static func show(message: String, undoAction: (() -> Void)? = nil, dismissAfter: Int?) {
    NSNotification.snackBar(message: message, undoAction: undoAction, dismissAfter: dismissAfter)
  }
}
