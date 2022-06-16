import Foundation

public enum ArticleContentStatus: String {
  case failed = "FAILED"
  case processing = "PROCESSING"
  case succeeded = "SUCCEEDED"
  case unknown = "UNKNOWN"
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
