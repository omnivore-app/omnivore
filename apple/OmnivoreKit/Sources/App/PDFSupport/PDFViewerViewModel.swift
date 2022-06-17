import Foundation
import Models
import Services
import Utils

final class PDFViewerViewModel: ObservableObject {
  @Published var errorMessage: String?
  @Published var readerView: Bool = false

  let pdfItem: PDFItem

  init(pdfItem: PDFItem) {
    self.pdfItem = pdfItem
  }

  func loadHighlightPatches(completion onComplete: @escaping ([String]) -> Void) {
    onComplete(pdfItem.highlights.map { $0.patch ?? "" })
  }

  func createHighlight(
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

  // swiftlint:disable:next function_parameter_count
  func mergeHighlight(
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

  func removeHighlights(dataService: DataService, highlightIds: [String]) {
    highlightIds.forEach { highlightID in
      dataService.deleteHighlight(highlightID: highlightID)
    }
  }

  func updateItemReadProgress(dataService: DataService, percent: Double, anchorIndex: Int) {
    dataService.updateLinkReadingProgress(
      itemID: pdfItem.itemID,
      readingProgress: percent,
      anchorIndex: anchorIndex
    )
  }

  func highlightShareURL(dataService: DataService, shortId: String) -> URL? {
    let baseURL = dataService.appEnvironment.serverBaseURL
    var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)

    if let username = dataService.currentViewer?.username {
      components?.path = "/\(username)/\(pdfItem.slug)/highlights/\(shortId)"
    } else {
      return nil
    }

    return components?.url
  }

  func downloadPDF(dataService: DataService) async -> URL? {
    do {
      if let localPdfURL = pdfItem.localPdfURL, FileManager.default.fileExists(atPath: localPdfURL.path) {
        return localPdfURL
      }

      if let tempURL = pdfItem.tempPDFURL {
        if (try? PDFUtils.copyToLocal(url: tempURL)) != nil {
          return tempURL
        }
      }

      return try await dataService.loadPDFData(slug: pdfItem.slug, pageURLString: pdfItem.originalArticleURL)
    } catch {
      print("error downloading PDF", error)
      return nil
    }
  }
}
