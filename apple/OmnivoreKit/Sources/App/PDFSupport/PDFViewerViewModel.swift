import Combine
import Foundation
import Models
import Services

public final class PDFViewerViewModel: ObservableObject {
  @Published public var errorMessage: String?
  @Published public var readerView: Bool = false

  public var feedItem: FeedItem

  var subscriptions = Set<AnyCancellable>()
  let services: Services

  public init(services: Services, feedItem: FeedItem) {
    self.services = services
    self.feedItem = feedItem
  }

  public func loadHighlights(completion onComplete: @escaping ([Highlight]) -> Void) {
    guard let viewer = services.dataService.currentViewer else { return }

    services.dataService.pdfHighlightsPublisher(username: viewer.username, slug: feedItem.slug).sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        onComplete(self?.allHighlights(fetchedHighlights: []) ?? [])
      },
      receiveValue: { [weak self] highlights in
        onComplete(self?.allHighlights(fetchedHighlights: highlights) ?? [])
      }
    )
    .store(in: &subscriptions)
  }

  private func allHighlights(fetchedHighlights: [Highlight]) -> [Highlight] {
    var resultSet = [String: Highlight]()

    for highlight in services.dataService.cachedHighlights(pdfID: feedItem.id) {
      resultSet[highlight.id] = highlight
    }
    for highlight in fetchedHighlights {
      resultSet[highlight.id] = highlight
    }
    for highlightId in services.dataService.fetchRemovedHighlightIds(pdfID: feedItem.id) {
      resultSet.removeValue(forKey: highlightId)
    }
    return Array(resultSet.values)
  }

  public func createHighlight(shortId: String, highlightID: String, quote: String, patch: String) {
    services.dataService.persistHighlight(
      pdfID: feedItem.id,
      highlight: Highlight(
        id: highlightID,
        shortId: shortId,
        quote: quote,
        prefix: nil,
        suffix: nil,
        patch: patch,
        annotation: nil,
        createdByMe: true
      )
    )

    services.dataService
      .createHighlightPublisher(
        shortId: shortId,
        highlightID: highlightID,
        quote: quote,
        patch: patch,
        articleId: feedItem.id
      )
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.errorMessage = error.localizedDescription
      } receiveValue: { value in
        print("highlight value", value)
      }
      .store(in: &subscriptions)
  }

  public func mergeHighlight(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    overlapHighlightIdList: [String]
  ) {
    services.dataService.persistHighlight(
      pdfID: feedItem.id,
      highlight: Highlight(
        id: highlightID,
        shortId: shortId,
        quote: quote,
        prefix: nil,
        suffix: nil,
        patch: patch,
        annotation: nil,
        createdByMe: true
      )
    )

    removeLocalHighlights(highlightIds: overlapHighlightIdList)

    services.dataService
      .mergeHighlightPublisher(
        shortId: shortId,
        highlightID: highlightID,
        quote: quote,
        patch: patch,
        articleId: feedItem.id,
        overlapHighlightIdList: overlapHighlightIdList
      )
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.errorMessage = error.localizedDescription
      } receiveValue: { value in
        print("highlight value", value)
      }
      .store(in: &subscriptions)
  }

  public func removeHighlights(highlightIds: [String]) {
    removeLocalHighlights(highlightIds: highlightIds)

    highlightIds.forEach { highlightId in
      services.dataService.deleteHighlightPublisher(highlightId: highlightId)
        .sink { [weak self] completion in
          guard case let .failure(error) = completion else { return }
          self?.errorMessage = error.localizedDescription
        } receiveValue: { value in
          print("remove highlight value", value)
        }
        .store(in: &subscriptions)
    }
  }

  public func updateItemReadProgress(percent: Double, anchorIndex: Int) {
    services.dataService
      .updateArticleReadingProgressPublisher(
        itemID: feedItem.id,
        readingProgress: percent,
        anchorIndex: anchorIndex
      )
      .sink { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      } receiveValue: { _ in
      }
      .store(in: &subscriptions)
  }

  public func highlightShareURL(shortId: String) -> URL? {
    let baseURL = services.dataService.appEnvironment.serverBaseURL
    var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)

    if let viewer = services.dataService.currentViewer?.username {
      components?.path = "/\(viewer)/\(feedItem.slug)/highlights/\(shortId)"
    } else {
      return nil
    }

    return components?.url
  }

  private func removeLocalHighlights(highlightIds: [String]) {
    services.dataService.removeHighlights(pdfID: feedItem.id, highlightIds: highlightIds)
  }
}
