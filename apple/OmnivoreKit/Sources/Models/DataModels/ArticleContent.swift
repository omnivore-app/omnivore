import Foundation

public struct ArticleContent {
  public let htmlContent: String
  public let highlightsJSONString: String

  public init(
    htmlContent: String,
    highlightsJSONString: String
  ) {
    self.htmlContent = htmlContent
    self.highlightsJSONString = highlightsJSONString
  }
}
