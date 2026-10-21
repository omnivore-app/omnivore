import CoreData
import Foundation

public enum ArticleContentStatus: String {
  case failed = "FAILED"
  case processing = "PROCESSING"
  case succeeded = "SUCCEEDED"
  case unknown = "UNKNOWN"
  case deleted = "DELETED"
}

public struct ArticleContent {
  public let id = UUID()
  public let title: String
  public let htmlContent: String
  public let highlightsJSONString: String
  public let contentStatus: ArticleContentStatus
  public let objectID: NSManagedObjectID?
  public let downloadURL: String

  public init(
    title: String,
    htmlContent: String,
    highlightsJSONString: String,
    contentStatus: ArticleContentStatus,
    objectID: NSManagedObjectID?,
    downloadURL: String
  ) {
    self.title = title
    self.htmlContent = htmlContent
    self.highlightsJSONString = highlightsJSONString
    self.contentStatus = contentStatus
    self.objectID = objectID
    self.downloadURL = downloadURL
  }
}

public extension String {
  var asArticleContentStatus: ArticleContentStatus? {
    ArticleContentStatus(rawValue: self)
  }
}
