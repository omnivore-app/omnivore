import Foundation
import Services
import Views

extension Snackbar {
  static func showInLibrary(message: String, undoAction: (() -> Void)? = nil) {
    NSNotification.librarySnackBar(message: message, undoAction: undoAction)
  }
}
