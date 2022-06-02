//
//  File.swift
//
//
//  Created by Jackson Harper on 6/1/22.
//

import Foundation
import Models
import Services
import Views

typealias UpdateStatusFunc = (ShareExtensionStatus) -> Void

class ExtensionSaveService {
  let queue: OperationQueue

  init() {
    self.queue = OperationQueue()
  }

  private func queueSaveOperation(_ pageScrape: PageScrapePayload, updateStatusFunc: UpdateStatusFunc?) {
    ProcessInfo().performExpiringActivity(withReason: "app.omnivore.SaveActivity") { [self] expiring in
      guard !expiring else {
        self.queue.cancelAllOperations()
        self.queue.waitUntilAllOperationsAreFinished()
        return
      }

      let operation = SaveOperation(pageScrapePayload: pageScrape, updateStatusFunc: updateStatusFunc)

      self.queue.addOperation(operation)
      self.queue.waitUntilAllOperationsAreFinished()
    }
  }

  public func save(_ extensionContext: NSExtensionContext, updateStatusFunc: UpdateStatusFunc?) {
    PageScraper.scrape(extensionContext: extensionContext) { [weak self] result in
      guard let self = self else { return }

      switch result {
      case let .success(payload):
        self.queueSaveOperation(payload, updateStatusFunc: updateStatusFunc)
      case let .failure(error):
        print("failed", error)
      }
    }
  }

  class SaveOperation: Operation, URLSessionDelegate {
    let requestId: String
    let services: Services
    let pageScrapePayload: PageScrapePayload
    let updateStatusFunc: UpdateStatusFunc?

    var queue: OperationQueue?
    var uploadTask: URLSessionTask?

    enum State: Int {
      case created
      case started
      case finished
    }

    init(pageScrapePayload: PageScrapePayload, updateStatusFunc: UpdateStatusFunc? = nil) {
      self.pageScrapePayload = pageScrapePayload
      self.updateStatusFunc = updateStatusFunc

      self.state = .created
      self.services = Services()
      self.requestId = UUID().uuidString.lowercased()
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
        await persist(services: self.services, pageScrapePayload: self.pageScrapePayload, requestId: self.requestId)
      }
    }

    override func cancel() {
      super.cancel()
    }

    private func updateStatus(newStatus: ShareExtensionStatus) {
      DispatchQueue.main.async {
        if let updateStatusFunc = self.updateStatusFunc {
          updateStatusFunc(newStatus)
        }
      }
    }

    private func persist(services: Services, pageScrapePayload: PageScrapePayload, requestId: String) async {
      do {
        try await services.dataService.persistPageScrapePayload(pageScrapePayload, requestId: requestId)
      } catch {
        updateStatus(newStatus: .failed(error: SaveArticleError.unknown(description: "Unable to access content")))
        return
      }

      do {
        updateStatus(newStatus: .saved)

        switch pageScrapePayload.contentType {
        case .none:
          try await services.dataService.syncUrl(id: requestId, url: pageScrapePayload.url)
        case let .pdf(localUrl):
          try await services.dataService.syncPdf(id: requestId, localPdfURL: localUrl, url: pageScrapePayload.url)
        case let .html(html, title, _):
          try await services.dataService.syncPage(id: requestId, originalHtml: html, title: title, url: pageScrapePayload.url)
        }

      } catch {
        print("ERROR SYNCING", error)
        updateStatus(newStatus: .syncFailed(error: SaveArticleError.unknown(description: "Unknown Error")))
      }

      state = .finished
      updateStatus(newStatus: .synced)
    }
  }
}
