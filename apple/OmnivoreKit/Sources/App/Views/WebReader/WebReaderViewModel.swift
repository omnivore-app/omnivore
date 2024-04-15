import Models
import Services
import SwiftUI
import Views
import WebKit
import Utils

struct SafariWebLink: Identifiable {
  let id: UUID
  let url: URL
}

@MainActor final class WebReaderViewModel: ObservableObject {
  @Published var articleContent: ArticleContent?
  @Published var errorMessage: String?
  @Published var allowRetry = false
  @Published var isDownloadingAudio: Bool = false
  @Published var audioDownloadTask: Task<Void, Error>?

  @Published var operationMessage: String?
  @Published var showOperationToast: Bool = false
  @Published var operationStatus: OperationStatus = .none

  @Published var explainText: String?

  func hasOriginalUrl(_ item: Models.LibraryItem) -> Bool {
    if let pageURLString = item.pageURLString, let host = URL(string: pageURLString)?.host {
      if host == "omnivore.app" {
        return false
      }
      return true
    }
    return false
  }

  func downloadAudio(audioController: AudioController, item: Models.LibraryItem) {
    Snackbar.show(message: "Downloading Offline Audio", dismissAfter: 2000)
    isDownloadingAudio = true

    if let audioDownloadTask = audioDownloadTask {
      audioDownloadTask.cancel()
    }

    let itemID = item.unwrappedID
    audioDownloadTask = Task.detached(priority: .background) {
      let canceled = Task.isCancelled
      let downloaded = await audioController.downloadForOffline(itemID: itemID)
      DispatchQueue.main.async {
        self.isDownloadingAudio = false
        if !canceled {
          Snackbar.show(message: downloaded ? "Audio file downloaded" : "Error downloading audio", dismissAfter: 2000)
        }
      }
    }
  }

  func loadContent(dataService: DataService, username: String, itemID: String, retryCount _: Int = 0) async {
    errorMessage = nil

    do {
      articleContent = try await dataService.loadArticleContentWithRetries(itemID: itemID, username: username)
    } catch {
      if let fetchError = error as? ContentFetchError {
        allowRetry = true
        switch fetchError {
        case .network:
          errorMessage = "We were unable to retrieve your content. Please check network connectivity and try again."
        default:
          errorMessage = "We were unable to parse your content."
        }
      } else {
        errorMessage = "We were unable to retrieve your content."
      }
    }
  }

  func createHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    let result = dataService.createHighlight(
      shortId: messageBody["shortId"] as? String ?? "",
      highlightID: messageBody["id"] as? String ?? "",
      quote: messageBody["quote"] as? String ?? "",
      patch: messageBody["patch"] as? String ?? "",
      articleId: messageBody["articleId"] as? String ?? "",
      positionPercent: messageBody["highlightPositionPercent"] as? Double,
      positionAnchorIndex: messageBody["highlightPositionAnchorIndex"] as? Int,
      annotation: messageBody["annotation"] as? String ?? ""
    )

    return replyHandler(["result": result], nil)
  }

  func deleteHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    if let highlightID = messageBody["highlightId"] as? String {
      dataService.deleteHighlight(highlightID: highlightID)
      replyHandler(["result": true], nil)
    } else {
      replyHandler(["result": false], nil)
    }
  }

  func mergeHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    guard
      let shortId = messageBody["shortId"] as? String,
      let highlightID = messageBody["id"] as? String,
      let quote = messageBody["quote"] as? String,
      let patch = messageBody["patch"] as? String,
      let articleId = messageBody["articleId"] as? String,
      let overlapHighlightIdList = messageBody["overlapHighlightIdList"] as? [String],
      let positionPercent = messageBody["highlightPositionPercent"] as? Double,
      let positionAnchorIndex = messageBody["highlightPositionAnchorIndex"] as? Int
    else {
      replyHandler([], "createHighlight: Error encoding response")
      return
    }

    let jsonHighlight = dataService.mergeHighlights(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: articleId,
      positionPercent: positionPercent,
      positionAnchorIndex: positionAnchorIndex,
      overlapHighlightIdList: overlapHighlightIdList
    )

    replyHandler(["result": jsonHighlight], nil)
  }

  func updateHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    let highlightID = messageBody["highlightId"] as? String
    let annotation = messageBody["annotation"] as? String

    if let highlightID = highlightID, let annotation = annotation {
      dataService.updateHighlightAttributes(highlightID: highlightID, annotation: annotation)
      replyHandler(["result": highlightID], nil)
    } else {
      replyHandler([], "updateHighlight: Error encoding response")
    }
  }

  func updateReadingProgress(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    let itemID = messageBody["id"] as? String
    let readingProgress = messageBody["readingProgressPercent"] as? Double
    let anchorIndex = messageBody["readingProgressAnchorIndex"] as? Int

    print("READING PROGRESS FROM JS: ", messageBody)
    guard let itemID = itemID, let readingProgress = readingProgress, let anchorIndex = anchorIndex else {
      replyHandler(["result": false], nil)
      return
    }

    dataService.updateLinkReadingProgress(itemID: itemID, readingProgress: readingProgress, anchorIndex: anchorIndex, force: false)
    replyHandler(["result": true], nil)
  }

  func webViewActionWithReplyHandler(
    message: WKScriptMessage,
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    guard let messageBody = message.body as? [String: Any] else { return }
    guard let actionID = messageBody["actionID"] as? String else { return }

    switch actionID {
    case "deleteHighlight":
      deleteHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "createHighlight":
      createHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "mergeHighlight":
      mergeHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "updateHighlight":
      updateHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "articleReadingProgress":
      updateReadingProgress(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    default:
      replyHandler(nil, "Unknown actionID: \(actionID)")
    }
  }

  func setLabelsForHighlight(
    highlightID: String,
    labelIDs: [String],
    dataService: DataService
  ) {
    dataService.setLabelsForHighlight(highlightID: highlightID, labelIDs: labelIDs)
  }

  func saveLink(dataService: DataService, url: URL) {
    Task {
      do {
        Snackbar.show(message: "Saving link", dismissAfter: 5000)
        _ = try await dataService.createPageFromUrl(id: UUID().uuidString, url: url.absoluteString)
        Snackbar.show(message: "Link saved", dismissAfter: 2000)
      } catch {
        Snackbar.show(message: "Error saving link", dismissAfter: 2000)
      }
    }
  }

  func saveLinkAndFetch(dataService: DataService, username: String, url: URL) {
    Task {
      do {
        Snackbar.show(message: "Saving link", dismissAfter: 5000)
        let requestId = UUID().uuidString
        _ = try await dataService.createPageFromUrl(id: requestId, url: url.absoluteString)
        Snackbar.show(message: "Link saved", dismissAfter: 2000)

        await loadContent(dataService: dataService, username: username, itemID: requestId, retryCount: 0)
      } catch {
        Snackbar.show(message: "Error saving link", dismissAfter: 2000)
      }
    }
  }
  
  func trackReadEvent(item: Models.LibraryItem) {
    let itemID = item.unwrappedID
    let slug = item.unwrappedSlug
    let originalArticleURL = item.unwrappedPageURLString

    EventTracker.track(
      .linkRead(
        linkID: itemID,
        slug: slug,
        reader: "WEB",
        originalArticleURL: originalArticleURL
      )
    )
  }
}
