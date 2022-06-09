import Combine
import CoreData
import Foundation
import Models
import Services

public final class PDFViewerViewModel: ObservableObject {
  @Published public var errorMessage: String?
  @Published public var readerView: Bool = false

  public let pdfItem: PDFItem

  var subscriptions = Set<AnyCancellable>()

  public init(pdfItem: PDFItem) {
    self.pdfItem = pdfItem
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

  public var itemDownloaded: Bool {
    if let localPdfURL = pdfItem.localPdfURL, FileManager.default.fileExists(atPath: localPdfURL.path) {
      return true
    }
    return false
  }

  public func downloadPDF(dataService: DataService) async -> URL? {
    do {
      if itemDownloaded {
        return pdfItem.localPdfURL
      }
      if let localURL = try await dataService.fetchPDFData(slug: pdfItem.slug, pageURLString: pdfItem.originalArticleURL) {
        return localURL
      }
    } catch {
      print("error downloading PDF", error)
    }
    return nil
  }
}
