import Foundation
import Models
import Services
import Utils
import Views

extension ShareExtensionViewModel {
  public func save(_ extensionContext: NSExtensionContext) {
    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      guard let self = self else { return }

      switch result {
      case let .success(payload):
        DispatchQueue.main.async {
          self.status = .saved

          let url = URLComponents(string: payload.url)
          let hostname = URL(string: payload.url)?.host ?? ""

          switch payload.contentType {
          case let .html(html: _, title: title, iconURL: iconURL):
            self.title = title
            self.iconURL = iconURL
            self.url = hostname
          case .none:
            self.url = hostname
            self.title = payload.url
            if var url = url {
              url.path = "/favicon.ico"
              self.iconURL = url.url?.absoluteString
            }
          case let .pdf(localUrl: localUrl):
            self.url = hostname
            self.title = PDFUtils.titleFromPdfFile(localUrl.absoluteString)
            Task {
              let localThumbnail = try await PDFUtils.createThumbnailFor(inputUrl: localUrl)
              DispatchQueue.main.async {
                self.iconURL = localThumbnail?.absoluteString
              }
            }
          }
        }

        #if os(iOS)
          self.queueSaveOperation(payload)
        #else
          Task {
            await createPage(services: self.services, pageScrapePayload: payload)
          }
        #endif
      case .failure:
        DispatchQueue.main.async {
          self.status = .failed(error: .unknown(description: "Could not retrieve content"))
        }
      }
    }
  }

  func createPage(pageScrapePayload: PageScrapePayload) async -> Bool {
    var newRequestID: String?

    do {
      try await services.dataService.persistPageScrapePayload(pageScrapePayload, requestId: requestId)
    } catch {
      updateStatusOnMain(
        requestId: nil,
        newStatus: .failed(error: SaveArticleError.unknown(description: "Unable to access content"))
      )
      return false
    }

    do {
      updateStatusOnMain(requestId: requestId, newStatus: .saved)

      switch pageScrapePayload.contentType {
      case .none:
        newRequestID = try await services.dataService.createPageFromUrl(id: requestId, url: pageScrapePayload.url)
      case let .pdf(localUrl):
        try await services.dataService.createPageFromPdf(
          id: requestId,
          localPdfURL: localUrl,
          url: pageScrapePayload.url
        )
      case let .html(html, title, _):
        newRequestID = try await services.dataService.createPage(
          id: requestId,
          originalHtml: html,
          title: title,
          url: pageScrapePayload.url
        )
      }
    } catch {
      updateStatusOnMain(
        requestId: nil,
        newStatus: .syncFailed(error: SaveArticleError.unknown(description: "Unknown Error"))
      )
      return false
    }

    updateStatusOnMain(requestId: newRequestID, newStatus: .synced)
    return true
  }

  func updateStatusOnMain(requestId: String?, newStatus: ShareExtensionStatus) {
    DispatchQueue.main.async {
      self.status = newStatus
      if let requestId = requestId {
        self.requestId = requestId
      }
    }
  }
}

final class SaveOperation: Operation, URLSessionDelegate {
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
