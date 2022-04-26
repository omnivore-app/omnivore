import Combine
import Models
import Services
import SwiftUI
import WebKit

struct SafariWebLink: Identifiable {
  let id: UUID
  let url: URL
}

final class WebReaderViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var articleContent: ArticleContent?

  var slug: String?
  var subscriptions = Set<AnyCancellable>()

  func loadContent(dataService: DataService, slug: String) {
    self.slug = slug
    isLoading = true

    guard let username = dataService.currentViewer?.username else { return }

    if let content = dataService.pageFromCache(slug: slug) {
      articleContent = content
    } else {
      dataService.articleContentPublisher(username: username, slug: slug).sink(
        receiveCompletion: { [weak self] completion in
          guard case .failure = completion else { return }
          self?.isLoading = false
        },
        receiveValue: { [weak self] articleContent in
          self?.articleContent = articleContent
        }
      )
      .store(in: &subscriptions)
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
      dataService.invalidateCachedPage(slug: slug)
      deleteHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "createHighlight":
      dataService.invalidateCachedPage(slug: slug)
      createHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "mergeHighlight":
      dataService.invalidateCachedPage(slug: slug)
      mergeHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "updateHighlight":
      dataService.invalidateCachedPage(slug: slug)
      updateHighlight(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    case "articleReadingProgress":
      updateReadingProgress(messageBody: messageBody, replyHandler: replyHandler, dataService: dataService)
    default:
      replyHandler(nil, "Unknown actionID: \(actionID)")
    }
  }
}
