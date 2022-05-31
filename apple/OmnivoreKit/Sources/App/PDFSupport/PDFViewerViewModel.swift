import Combine
import CoreData
import Foundation
import Models
import Services

public final class PDFViewerViewModel: ObservableObject {
  @Published public var errorMessage: String?
  @Published public var readerView: Bool = false

  public let pdfItem: PDFItem
  private var storedURL: URL?

  var subscriptions = Set<AnyCancellable>()

  public init(pdfItem: PDFItem) {
    self.pdfItem = pdfItem
  }

  public func dataURL(remoteURL: URL) -> URL {
    // TODO: we should probably not reach this point of localPdfURL is not set
    // this means the PDF has not been downloaded yet, so we likely don't have
    // a valid URL to work with.

    if let storedURL = pdfItem.localPdfURL {
      return storedURL
    }

    return remoteURL
  }

  public func loadHighlightPatches(completion onComplete: @escaping ([String]) -> Void) {
    onComplete(pdfItem.highlights.map { $0.patch ?? "" })
  }

  public func createHighlight(
    dataService: DataService,
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String
  ) {
    _ = dataService.createHighlight(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: pdfItem.itemID
    )
  }

  public func mergeHighlight(
    dataService: DataService,
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    overlapHighlightIdList: [String]
  ) {
    _ = dataService.mergeHighlights(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: pdfItem.itemID,
      overlapHighlightIdList: overlapHighlightIdList
    )
  }

  public func removeHighlights(dataService: DataService, highlightIds: [String]) {
    highlightIds.forEach { highlightID in
      dataService.deleteHighlight(highlightID: highlightID)
    }
  }

  public func updateItemReadProgress(dataService: DataService, percent: Double, anchorIndex: Int) {
    dataService.updateLinkReadingProgress(
      itemID: pdfItem.itemID,
      readingProgress: percent,
      anchorIndex: anchorIndex
    )
  }

  public func highlightShareURL(dataService: DataService, shortId: String) -> URL? {
    let baseURL = dataService.appEnvironment.serverBaseURL
    var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)

    if let username = dataService.currentViewer?.username {
      components?.path = "/\(username)/\(pdfItem.slug)/highlights/\(shortId)"
    } else {
      return nil
    }

    return components?.url
  }
}
