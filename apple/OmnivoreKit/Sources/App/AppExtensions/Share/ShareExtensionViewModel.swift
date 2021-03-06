import CoreData
import Models
import SwiftUI
import Utils
import Views

public class ShareExtensionViewModel: ObservableObject {
  @Published public var status: ShareExtensionStatus = .processing
  @Published public var title: String?
  @Published public var url: String?
  @Published public var iconURL: String?
  @Published public var linkedItem: LinkedItem?
  @Published public var requestId = UUID().uuidString.lowercased()
  @Published var debugText: String?

  let services = Services()
  let queue = OperationQueue()

  func handleReadNowAction(extensionContext: NSExtensionContext?) {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestId)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif
    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  func savePage(extensionContext: NSExtensionContext?) {
    if let extensionContext = extensionContext {
      save(extensionContext)
    } else {
      DispatchQueue.main.async {
        self.status = .failed(error: .unknown(description: "Internal Error"))
      }
    }
  }

  #if os(iOS)
    func queueSaveOperation(_ payload: PageScrapePayload) {
      ProcessInfo().performExpiringActivity(withReason: "app.omnivore.SaveActivity") { [self] expiring in
        guard !expiring else {
          self.queue.cancelAllOperations()
          self.queue.waitUntilAllOperationsAreFinished()
          return
        }

        let operation = ShareExtensionSaveOperation(pageScrapePayload: payload, shareExtensionViewModel: self)
        self.queue.addOperation(operation)
        self.queue.waitUntilAllOperationsAreFinished()
      }
    }
  #endif

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
            await self.createPage(pageScrapePayload: payload)
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
    var linkedItemObjectID: NSManagedObjectID?

    do {
      linkedItemObjectID = try await services.dataService.persistPageScrapePayload(
        pageScrapePayload,
        requestId: requestId
      )
    } catch {
      updateStatusOnMain(
        requestId: nil,
        newStatus: .failed(error: SaveArticleError.unknown(description: "Unable to access content"))
      )
      return false
    }

    do {
      updateStatusOnMain(requestId: requestId, newStatus: .saved, objectID: linkedItemObjectID)

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

  func updateStatusOnMain(requestId: String?, newStatus: ShareExtensionStatus, objectID: NSManagedObjectID? = nil) {
    DispatchQueue.main.async {
      self.status = newStatus
      if let requestId = requestId {
        self.requestId = requestId
      }

      if let objectID = objectID {
        self.linkedItem = self.services.dataService.viewContext.object(with: objectID) as? LinkedItem
      }
    }
  }
}

public enum ShareExtensionStatus {
  case processing
  case saved
  case synced
  case failed(error: SaveArticleError)
  case syncFailed(error: SaveArticleError)

  var displayMessage: String {
    switch self {
    case .processing:
      return LocalText.saveArticleProcessingState
    case .saved:
      return LocalText.saveArticleSavedState
    case .synced:
      return "Synced"
    case let .failed(error: error):
      return "Save failed \(error.displayMessage)"
    case let .syncFailed(error: error):
      return "Sync failed \(error.displayMessage)"
    }
  }
}

private extension SaveArticleError {
  var displayMessage: String {
    switch self {
    case .unauthorized:
      return LocalText.extensionAppUnauthorized
    case .network:
      return LocalText.networkError
    case .badData, .unknown:
      return LocalText.genericError
    }
  }
}
