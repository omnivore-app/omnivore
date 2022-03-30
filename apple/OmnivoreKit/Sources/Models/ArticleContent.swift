import Foundation

public class CachedPageContent: NSObject {
  public let value: ArticleContent

  public init(_ content: ArticleContent) {
    self.value = content
  }
}

public struct ArticleContent {
  public let htmlContent: String
  public let highlights: [Highlight]

  public init(
    htmlContent: String,
    highlights: [Highlight]
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
