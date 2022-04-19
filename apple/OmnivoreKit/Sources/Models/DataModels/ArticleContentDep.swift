import Foundation

public struct ArticleContentDep {
  public let htmlContent: String
  public let highlights: [HighlightDep]
  public let storedHighlightsJSONString: String?

  public init(
    htmlContent: String,
    highlights: [HighlightDep],
    storedHighlightsJSONString: String?
  ) {
    self.htmlContent = htmlContent
    self.highlights = highlights
    self.storedHighlightsJSONString = storedHighlightsJSONString
  }

  public var highlightsJSONString: String {
    if let storedHighlightsJSONString = storedHighlightsJSONString {
      return storedHighlightsJSONString
    }

    let jsonData = try? JSONEncoder().encode(highlights)
    guard let jsonData = jsonData else { return "[]" }
    return String(data: jsonData, encoding: .utf8) ?? "[]"
  }
}
