import Foundation
import Models
import Services
import Utils
import Views

final class ShareExtensionSaveOperation: Operation, URLSessionDelegate {
  let pageScrapePayload: PageScrapePayload
  let shareExtensionViewModel: ShareExtensionViewModel

  var queue: OperationQueue?
  var uploadTask: URLSessionTask?

  enum State: Int {
    case created
    case started
    case finished
  }

  init(pageScrapePayload: PageScrapePayload, shareExtensionViewModel: ShareExtensionViewModel) {
    self.pageScrapePayload = pageScrapePayload
    self.shareExtensionViewModel = shareExtensionViewModel

    self.state = .created
  }

  public var state: State = .created {
    willSet {
      willChangeValue(forKey: "isReady")
      willChangeValue(forKey: "isExecuting")
      willChangeValue(forKey: "isFinished")
      willChangeValue(forKey: "isCancelled")
    }
    didSet {
      didChangeValue(forKey: "isCancelled")
      didChangeValue(forKey: "isFinished")
      didChangeValue(forKey: "isExecuting")
      didChangeValue(forKey: "isReady")
    }
  }

  override var isAsynchronous: Bool {
    true
  }

  override var isReady: Bool {
    true
  }

  override var isExecuting: Bool {
    self.state == .started
  }

  override var isFinished: Bool {
    self.state == .finished
  }

  override func start() {
    guard !isCancelled else { return }
    state = .started
    queue = OperationQueue()

    Task {
      let pageCreated = await shareExtensionViewModel.createPage(
        pageScrapePayload: pageScrapePayload
      )
      if pageCreated {
        state = .finished
      }
    }
  }

  override func cancel() {
    super.cancel()
  }
}
