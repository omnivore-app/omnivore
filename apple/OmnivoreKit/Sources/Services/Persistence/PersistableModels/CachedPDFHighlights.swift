import Combine
import Foundation
import Models

final class CachedPDFHighlights {
  init(pdfID: String, highlights: [Highlight], removedHighlightIDs: [String]) {
    self.pdfID = pdfID
    self.highlights = highlights
    self.removedHighlightIDs = removedHighlightIDs
  }

  let pdfID: String
  var highlights: [Highlight]
  var removedHighlightIDs: [String]
}

public extension DataService {
  func cachedHighlights(pdfID: String) -> [Highlight] {
    fetchCachedHighlights(pdfID: pdfID as NSString)?.highlights ?? []
  }

  func fetchRemovedHighlightIds(pdfID: String) -> [String] {
    fetchCachedHighlights(pdfID: pdfID as NSString)?.removedHighlightIDs ?? []
  }

  func persistHighlight(pdfID: String, highlight: Highlight) {
    let cachedHighlights =
      fetchCachedHighlights(pdfID: pdfID as NSString)
        ?? CachedPDFHighlights(pdfID: pdfID, highlights: [], removedHighlightIDs: [])

    cachedHighlights.highlights.append(highlight)
    insertCachedHighlights(highlights: cachedHighlights, pdfID: pdfID as NSString)
  }

  func removeHighlights(pdfID: String, highlightIds: [String]) {
    let cachedHighlights =
      fetchCachedHighlights(pdfID: pdfID as NSString)
        ?? CachedPDFHighlights(pdfID: pdfID, highlights: [], removedHighlightIDs: [])

    cachedHighlights.removedHighlightIDs.append(contentsOf: highlightIds)
    insertCachedHighlights(highlights: cachedHighlights, pdfID: pdfID as NSString)
  }

  private func fetchCachedHighlights(pdfID: NSString) -> CachedPDFHighlights? {
    var cachedHighlights: CachedPDFHighlights?
    highlightsCacheQueue.sync {
      cachedHighlights = highlightsCache.object(forKey: pdfID as NSString)
    }
    return cachedHighlights
  }

  private func insertCachedHighlights(highlights: CachedPDFHighlights, pdfID: NSString) {
    highlightsCacheQueue.async(flags: .barrier) {
      self.highlightsCache.setObject(highlights, forKey: pdfID as AnyObject)
    }
  }
}
