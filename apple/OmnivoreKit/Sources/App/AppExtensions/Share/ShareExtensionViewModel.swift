import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor
public class ShareExtensionViewModel: ObservableObject {
  @Published public var status: ShareExtensionStatus = .processing
  @Published public var title: String = ""
  @Published public var url: String?
  @Published public var iconURL: URL?
  @Published public var highlightData: HighlightData?
  @Published public var linkedItem: Models.LibraryItem?
  @Published public var requestId = UUID().uuidString.lowercased()
  @Published var debugText: String?
  @Published var noteText: String = ""

  public let services = Services()
  let queue = OperationQueue()

  public init() {}

  func handleReadNowAction(extensionContext: NSExtensionContext?) {
    #if os(iOS)
      if let application = UIApplication.value(forKeyPath: #keyPath(UIApplication.shared)) as? UIApplication {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestId)")
        application.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #else
      if let workspace = NSWorkspace.value(forKeyPath: #keyPath(NSWorkspace.shared)) as? NSWorkspace {
        let deepLinkUrl = NSURL(string: "omnivore://shareExtensionRequestID/\(requestId)")
        workspace.perform(NSSelectorFromString("openURL:"), with: deepLinkUrl)
      }
    #endif

    extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
  }

  public func dismissExtension(extensionContext: NSExtensionContext?) {
    if let extensionContext = extensionContext {
      extensionContext.completeRequest(returningItems: [], completionHandler: nil)
    }
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

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    dataService.archiveLink(objectID: objectID, archived: archived)
  }

  func removeLibraryItem(dataService: DataService, objectID: NSManagedObjectID) {
    dataService.removeLibraryItem(objectID: objectID)
  }

  func submitTitleEdit(dataService: DataService, itemID: String, title: String, description: String) {
    dataService.updateLinkedItemTitleAndDescription(
      itemID: itemID,
      title: title,
      description: description,
      author: nil
    )
  }

  func saveNote() {
    if let linkedItem = linkedItem {
      if let noteHighlight = linkedItem.noteHighlight, let noteHighlightID = noteHighlight.id {
        services.dataService.updateHighlightAttributes(highlightID: noteHighlightID, annotation: noteText)
      } else {
        let createdHighlightId = UUID().uuidString.lowercased()
        let createdShortId = NanoID.generate(alphabet: NanoID.Alphabet.urlSafe.rawValue, size: 8)

        _ = services.dataService.createNote(shortId: createdShortId,
                                            highlightID: createdHighlightId,
                                            articleId: linkedItem.unwrappedID,
                                            annotation: noteText)
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

          let hostname = URL(string: payload.url)?.host ?? ""

          switch payload.contentType {
          case let .html(html: _, title: title, iconURL: iconURL, highlightData: highlightData):
            self.title = title ?? ""
            self.url = hostname
            self.iconURL = iconURL
            self.highlightData = highlightData
          case .none:
            self.url = hostname
            self.title = payload.url
          case let .pdf(localUrl: localUrl):
            self.url = hostname
            self.title = PDFUtils.titleFromPdfFile(localUrl.absoluteString)
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
      case let .html(html, title, _, _):
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

    // Prefetch the newly saved content
    if
      let itemID = newRequestID,
      let currentViewer = services.dataService.currentViewer?.username,
      (try? await services.dataService.loadArticleContentWithRetries(itemID: itemID, username: currentViewer)) != nil
    {
      updateStatusOnMain(requestId: requestId, newStatus: .synced, objectID: linkedItemObjectID)
    }

    return true
  }

  func updateStatusOnMain(requestId: String?, newStatus: ShareExtensionStatus, objectID: NSManagedObjectID? = nil) {
    DispatchQueue.main.async {
      self.status = newStatus
      if let requestId = requestId {
        self.requestId = requestId
      }

      if let objectID = objectID {
        self.linkedItem = self.services.dataService.viewContext.object(with: objectID) as? Models.LibraryItem
        if let title = self.linkedItem?.title {
          self.title = title
        }
        if let iconURL = self.linkedItem?.imageURL {
          self.iconURL = iconURL
        }
        if let noteHighlight = self.linkedItem?.highlights?
          .compactMap({ $0 as? Highlight })
          .first(where: { $0.type == "NOTE" }),
          let noteText = noteHighlight.annotation
        {
          self.noteText = noteText
        }
        if let urlStr = self.linkedItem?.pageURLString, let hostname = URL(string: urlStr)?.host {
          self.url = hostname
        } else {
          self.url = self.linkedItem?.pageURLString
        }
      }
    }
  }
}

public enum ShareExtensionStatus: Equatable {
  public static func == (lhs: ShareExtensionStatus, rhs: ShareExtensionStatus) -> Bool {
    lhs.displayMessage == rhs.displayMessage
  }

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
      return LocalText.errorNetwork
    case .badData, .unknown:
      return LocalText.errorGeneric
    }
  }
}
