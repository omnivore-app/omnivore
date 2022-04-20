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
      // continue to load from the web if possible
    }

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

  func createHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    dataService.createHighlightPublisher(
      shortId: messageBody["shortId"] as? String ?? "",
      highlightID: messageBody["id"] as? String ?? "",
      quote: messageBody["quote"] as? String ?? "",
      patch: messageBody["patch"] as? String ?? "",
      articleId: messageBody["articleId"] as? String ?? "",
      annotation: messageBody["annotation"] as? String ?? ""
    )
    .sink { completion in
      guard case .failure = completion else { return }
      replyHandler([], "createHighlight: Error encoding response")
    } receiveValue: { result in
      if let result = result {
        replyHandler(["result": result], nil)
      } else {
        replyHandler([], "createHighlight: Error encoding response")
      }
    }
    .store(in: &subscriptions)
  }

  func deleteHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    dataService.deleteHighlightPublisher(
      highlightId: messageBody["highlightId"] as? String ?? ""
    )
    .sink { completion in
      guard case .failure = completion else { return }
      replyHandler(["result": false], nil)
    } receiveValue: { _ in
      replyHandler(["result": true], nil)
    }
    .store(in: &subscriptions)
  }

  func mergeHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    dataService.mergeHighlightPublisher(
      shortId: messageBody["shortId"] as? String ?? "",
      highlightID: messageBody["id"] as? String ?? "",
      quote: messageBody["quote"] as? String ?? "",
      patch: messageBody["patch"] as? String ?? "",
      articleId: messageBody["articleId"] as? String ?? "",
      overlapHighlightIdList: messageBody["overlapHighlightIdList"] as? [String] ?? []
    )
    .sink { completion in
      guard case .failure = completion else { return }
      replyHandler([], "mergeHighlight: Error encoding response")
    } receiveValue: { result in
      if let highlightValue = result {
        replyHandler(["result": highlightValue], nil)
      } else {
        replyHandler([], "createHighlight: Error encoding response")
      }
    }
    .store(in: &subscriptions)
  }

  func updateHighlight(
    messageBody: [String: Any],
    replyHandler: @escaping WKScriptMessageReplyHandler,
    dataService: DataService
  ) {
    dataService.updateHighlightAttributesPublisher(
      highlightID: messageBody["highlightId"] as? String ?? "",
      annotation: messageBody["annotation"] as? String ?? "",
      sharedAt: nil
    )
    .sink { completion in
      guard case .failure = completion else { return }
      replyHandler([], "updateHighlight: Error encoding response")
    } receiveValue: { highlightID in
      // Update highlight JS code just expects the highlight ID back
      replyHandler(["result": highlightID], nil)
    }
    .store(in: &subscriptions)
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

    dataService.updateArticleReadingProgressPublisher(
      itemID: itemID,
      readingProgress: readingProgress,
      anchorIndex: anchorIndex
    )
    .sink { completion in
      guard case .failure = completion else { return }
      replyHandler(["result": false], nil)
    } receiveValue: { _ in
      replyHandler(["result": true], nil)
    }
    .store(in: &subscriptions)
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
