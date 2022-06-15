import Foundation

public enum ArticleContentStatus {
  case failed
  case processing
  case succeeded
  case unknown
}

public struct ArticleContent {
  public let title: String
  public let htmlContent: String
  public let highlightsJSONString: String
  public let contentStatus: ArticleContentStatus

  public init(
    title: String,
    htmlContent: String,
    highlightsJSONString: String,
    contentStatus: ArticleContentStatus
  ) {
    self.title = title
    self.htmlContent = htmlContent
    self.highlightsJSONString = highlightsJSONString
    self.contentStatus = contentStatus
  }
}
