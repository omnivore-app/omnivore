import Models
import Services
import SwiftUI
import Views
import Transmission

@MainActor public struct PrimaryContentView: View {
  @State var showSnackbar = false
  @State var snackbarMessage: String?
  @State var snackbarUndoAction: (() -> Void)?

  @State private var snackbarTimer: Timer?

  public var body: some View {
    ZStack {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $showSnackbar) {
        InformationalSnackbar(message: snackbarMessage, undoAction: snackbarUndoAction)
      } label: {
        EmptyView()
      }.buttonStyle(.plain)

      innerBody
    }
      .onReceive(NSNotification.snackBarPublisher) { notification in
        if let message = notification.userInfo?["message"] as? String {
          snackbarUndoAction = notification.userInfo?["undoAction"] as? (() -> Void)
          snackbarMessage = message
          showSnackbar = true

          let dismissAfter = notification.userInfo?["dismissAfter"] as? Int ?? 2000
          if snackbarTimer == nil {
            startTimer(amount: dismissAfter)
          } else {
            increaseTimeout(amount: dismissAfter)
          }
        }
      }
  }

  public var innerBody: some View {
    #if os(iOS)
      if UIDevice.isIPad {
        return AnyView(
          LibrarySplitView()
        )
      } else {
        return AnyView(
          LibraryTabView()
        )
      }
    #else
      return AnyView(splitView)
    #endif
  }

  func startTimer(amount: Int) {
    self.snackbarTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(amount / 1000), repeats: false) { _ in
      DispatchQueue.main.async {
        self.showSnackbar = false
      }
    }
  }

  func stopTimer() {
    snackbarTimer?.invalidate()
  }

  func increaseTimeout(amount: Int) {
    stopTimer()
    startTimer(amount: amount)
  }
}
