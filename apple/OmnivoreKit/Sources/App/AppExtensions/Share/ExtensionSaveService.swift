//
//  File.swift
//
//
//  Created by Jackson Harper on 6/1/22.
//

import Foundation
import Models
import Services
import Utils
import Views

class ExtensionSaveService {
  let queue: OperationQueue

  init() {
    self.queue = OperationQueue()
  }

  private func queueSaveOperation(_ pageScrape: PageScrapePayload, shareExtensionViewModel: ShareExtensionChildViewModel) {
    ProcessInfo().performExpiringActivity(withReason: "app.omnivore.SaveActivity") { [self] expiring in
      guard !expiring else {
        self.queue.cancelAllOperations()
        self.queue.waitUntilAllOperationsAreFinished()
        return
      }

      let operation = SaveOperation(pageScrapePayload: pageScrape, shareExtensionViewModel: shareExtensionViewModel)

      self.queue.addOperation(operation)
      self.queue.waitUntilAllOperationsAreFinished()
    }
  }

  public func save(_ extensionContext: NSExtensionContext, shareExtensionViewModel: ShareExtensionChildViewModel) {
    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      guard let self = self else { return }

      switch result {
      case let .success(payload):
        DispatchQueue.main.async {
          shareExtensionViewModel.status = .saved

          let url = URLComponents(string: payload.url)
          let hostname = URL(string: payload.url)?.host ?? ""

          switch payload.contentType {
          case let .html(html: _, title: title, iconURL: iconURL):
            shareExtensionViewModel.title = title
            shareExtensionViewModel.iconURL = iconURL
            shareExtensionViewModel.url = hostname
          case .none:
            shareExtensionViewModel.url = hostname
            shareExtensionViewModel.title = payload.url
            if var url = url {
              url.path = "/favicon.ico"
              shareExtensionViewModel.iconURL = url.url?.absoluteString
            }
          case let .pdf(localUrl: localUrl):
            shareExtensionViewModel.url = hostname
            shareExtensionViewModel.title = PDFUtils.titleFromPdfFile(localUrl.absoluteString)
            Task {
              let localThumbnail = try await PDFUtils.createThumbnailFor(inputUrl: localUrl)
              DispatchQueue.main.async {
                shareExtensionViewModel.iconURL = localThumbnail?.absoluteString
              }
            }
          }
        }
        self.queueSaveOperation(payload, shareExtensionViewModel: shareExtensionViewModel)
      case .failure:
        DispatchQueue.main.async {
          shareExtensionViewModel.status = .failed(error: .unknown(description: "Could not retrieve content"))
        }
      }
    }
  }

  class SaveOperation: Operation, URLSessionDelegate {
    let services: Services
    let pageScrapePayload: PageScrapePayload
    let shareExtensionViewModel: ShareExtensionChildViewModel

    var queue: OperationQueue?
    var uploadTask: URLSessionTask?

    enum State: Int {
      case created
      case started
      case finished
    }

    init(pageScrapePayload: PageScrapePayload, shareExtensionViewModel: ShareExtensionChildViewModel) {
      self.pageScrapePayload = pageScrapePayload
      self.shareExtensionViewModel = shareExtensionViewModel

      self.state = .created
      self.services = Services()
    }

    open var state: State = .created {
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
        await persist(services: self.services, pageScrapePayload: self.pageScrapePayload)
      }
    }

    override func cancel() {
      super.cancel()
    }

    private func updateStatus(_ requestId: String?, newStatus: ShareExtensionStatus) {
      DispatchQueue.main.async {
        self.shareExtensionViewModel.status = newStatus
        if let requestId = requestId {
          self.shareExtensionViewModel.requestId = requestId
        }
      }
    }

    private func persist(services: Services, pageScrapePayload: PageScrapePayload) async {
      var requestId = shareExtensionViewModel.requestId

      do {
        try await services.dataService.persistPageScrapePayload(pageScrapePayload, requestId: requestId)
      } catch {
        updateStatus(nil, newStatus: .failed(error: SaveArticleError.unknown(description: "Unable to access content")))
        return
      }

      do {
        updateStatus(requestId, newStatus: .saved)

        switch pageScrapePayload.contentType {
        case .none:
          requestId = try await services.dataService.createPageFromUrl(id: requestId, url: pageScrapePayload.url)
        case let .pdf(localUrl):
          try await services.dataService.createPageFromPdf(
            id: requestId,
            localPdfURL: localUrl,
            url: pageScrapePayload.url
          )
        case let .html(html, title, _):
          requestId = try await services.dataService.createPage(
            id: requestId,
            originalHtml: html,
            title: title,
            url: pageScrapePayload.url
          )
        }

      } catch {
        updateStatus(nil, newStatus: .syncFailed(error: SaveArticleError.unknown(description: "Unknown Error")))
        return
      }

      updateStatus(requestId, newStatus: .synced)
      state = .finished
    }
  }
}
