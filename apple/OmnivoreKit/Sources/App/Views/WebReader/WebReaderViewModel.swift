import Models
import Services
import SwiftUI
import WebKit

struct SafariWebLink: Identifiable {
  let id: UUID
  let url: URL
}

@MainActor final class WebReaderViewModel: ObservableObject {
  @Published var articleContent: ArticleContent?
  @Published var errorMessage: String?

  func loadContent(dataService: DataService, itemID: String, retryCount: Int = 0) async {
    errorMessage = nil

    do {
      articleContent = try await dataService.loadArticleContent(itemID: itemID)
    } catch {
      if retryCount == 0 {
        return await loadContent(dataService: dataService, itemID: itemID, retryCount: 1)
      }
      if let fetchError = error as? ContentFetchError {
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
      let overlapHighlightIdList = messageBody["overlapHighlightIdList"] as? [String]
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

    guard let itemID = itemID, let readingProgress = readingProgress, let anchorIndex = anchorIndex else {
      replyHandler(["result": false], nil)
      return
    }

    dataService.updateLinkReadingProgress(itemID: itemID, readingProgress: readingProgress, anchorIndex: anchorIndex)
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
}
