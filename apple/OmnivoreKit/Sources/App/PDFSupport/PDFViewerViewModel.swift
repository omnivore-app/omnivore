import Combine
import CoreData
import Foundation
import Models
import Services

public final class PDFViewerViewModel: ObservableObject {
  @Published public var errorMessage: String?
  @Published public var readerView: Bool = false

  public var linkedItem: LinkedItem
  private var storedURL: URL?

  var subscriptions = Set<AnyCancellable>()
  let services: Services

  public init(services: Services, linkedItem: LinkedItem) {
    self.services = services
    self.linkedItem = linkedItem
  }

  public func dataURL(remoteURL: URL) -> URL {
    if let storedURL = storedURL {
      return storedURL
    }

    guard let data = linkedItem.pdfData else { return remoteURL }

    let subPath = linkedItem.unwrappedTitle.isEmpty ? UUID().uuidString : linkedItem.unwrappedTitle

    let path = FileManager.default
      .urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(subPath)

    do {
      try data.write(to: path)
      storedURL = path
      return path
    } catch {
      return remoteURL
    }
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
    _ = services.dataService.mergeHighlights(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: linkedItem.unwrappedID,
      overlapHighlightIdList: overlapHighlightIdList
    )
  }

  public func removeHighlights(highlightIds: [String]) {
    highlightIds.forEach { highlightID in
      services.dataService.deleteHighlight(highlightID: highlightID)
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
