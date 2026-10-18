import Foundation
import Models
import Services
import Utils
// import Views

final class PDFViewerViewModel: ObservableObject {
  @Published var errorMessage: String?
  @Published var readerView: Bool = false

  let pdfItem: PDFItem
  var highlights: [Highlight]

  init(pdfItem: PDFItem) {
    self.pdfItem = pdfItem
    self.highlights = pdfItem.highlights
  }

  func findHighlight(dataService: DataService, highlightID: String) -> Highlight? {
    let libraryItem = LibraryItem.lookup(byID: pdfItem.itemID, inContext: dataService.viewContext)
    return libraryItem?.highlights.asArray(of: Highlight.self).first { $0.id == highlightID }
  }

  func loadHighlightPatches(completion onComplete: @escaping ([String]) -> Void) {
    onComplete(pdfItem.highlights.map { $0.patch ?? "" })
  }

  // swiftlint:disable:next function_parameter_count
  func createHighlight(
    dataService: DataService,
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    positionPercent: Double?,
    positionAnchorIndex: Int?
  ) {
    _ = dataService.createHighlight(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: pdfItem.itemID,
      positionPercent: positionPercent,
      positionAnchorIndex: positionAnchorIndex
    )
  }

  // swiftlint:disable:next function_parameter_count
  func mergeHighlight(
    dataService: DataService,
    shortId: String,
    highlightID: String,
    quote: String,
    patch: String,
    positionPercent: Double?,
    positionAnchorIndex: Int?,
    overlapHighlightIdList: [String]
  ) {
    _ = dataService.mergeHighlights(
      shortId: shortId,
      highlightID: highlightID,
      quote: quote,
      patch: patch,
      articleId: pdfItem.itemID,
      positionPercent: positionPercent,
      positionAnchorIndex: positionAnchorIndex,
      overlapHighlightIdList: overlapHighlightIdList
    )
  }

  func removeHighlights(dataService: DataService, highlightIds: [String]) {
    highlightIds.forEach { highlightID in
      dataService.deleteHighlight(highlightID: highlightID)
    }
  }

  func updateAnnotation(highlightID: String, annotation: String, dataService: DataService) {
    dataService.updateHighlightAttributes(highlightID: highlightID, annotation: annotation)

    if let highlight = pdfItem.highlights.first(where: { $0.id == highlightID }) {
      highlight.annotation = annotation
    }
  }

  func updateItemReadProgress(dataService: DataService, percent: Double, anchorIndex: Int, force: Bool = false) {
    dataService.updateLinkReadingProgress(
      itemID: pdfItem.itemID,
      readingProgress: percent,
      anchorIndex: anchorIndex,
      force: force
    )
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

      if let result = try? await dataService.loadPDFData(slug: pdfItem.slug, downloadURL: pdfItem.downloadURL) {
        return result
      }

      // Downloading failed, try to get the article again, and then download
      if let content = try? await dataService.loadArticleContentWithRetries(itemID: pdfItem.itemID, username: "me") {
        // refetched the content, now try one more time then throw
        if let result = try await dataService.loadPDFData(slug: pdfItem.slug, downloadURL: content.downloadURL) {
          return result
        }
      }
      return nil
    } catch {
      print("error downloading PDF", error)
      return nil
    }
  }
}
