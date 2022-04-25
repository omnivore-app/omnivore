import Combine
import CoreData
import Foundation
import Models
import Services

public final class PDFViewerViewModel: ObservableObject {
  @Published public var errorMessage: String?
  @Published public var readerView: Bool = false

  public var linkedItem: LinkedItem

  var subscriptions = Set<AnyCancellable>()
  let services: Services

  public init(services: Services, linkedItem: LinkedItem) {
    self.services = services
    self.linkedItem = linkedItem
  }

  public func loadHighlightPatches(completion onComplete: @escaping ([String]) -> Void) {
    onComplete(linkedItem.highlights.asArray(of: Highlight.self).map { $0.patch ?? "" })
  }

  public func createHighlight(shortId: String, highlightID: String, quote: String, patch: String) {
    _ = services.dataService.createHighlight(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: linkedItem.unwrappedID
    )
  }

  public func mergeHighlight(
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    overlapHighlightIdList: [String]
  ) {
    services.dataService
      .mergeHighlightPublisher(
        shortId: shortId,
        highlightID: highlightID,
        quote: quote,
        patch: patch,
        articleId: linkedItem.unwrappedID,
        overlapHighlightIdList: overlapHighlightIdList
      )
      .sink { [weak self] completion in
        guard case let .failure(error) = completion else { return }
        self?.errorMessage = error.localizedDescription
      } receiveValue: { _ in }
      .store(in: &subscriptions)
  }

  public func removeHighlights(highlightIds: [String]) {
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
    services.dataService.updateLinkReadingProgress(
      itemID: linkedItem.unwrappedID,
      readingProgress: percent,
      anchorIndex: anchorIndex
    )
  }

  public func highlightShareURL(shortId: String) -> URL? {
    let baseURL = services.dataService.appEnvironment.serverBaseURL
    var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)

    if let username = services.dataService.currentViewer?.username {
      components?.path = "/\(username)/\(linkedItem.unwrappedSlug)/highlights/\(shortId)"
    } else {
      return nil
    }

    return components?.url
  }
}
