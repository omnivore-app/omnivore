import Foundation

public struct ArticleContentDep {
  public let htmlContent: String
  public let highlights: [HighlightDep]

  public init(
    htmlContent: String,
    highlights: [HighlightDep]
  ) {
    self.htmlContent = htmlContent
    self.highlights = highlights
  }

  public var highlightsJSONString: String {
    let jsonData = try? JSONEncoder().encode(highlights)
    guard let jsonData = jsonData else { return "[]" }
    return String(data: jsonData, encoding: .utf8) ?? "[]"
  }
}
