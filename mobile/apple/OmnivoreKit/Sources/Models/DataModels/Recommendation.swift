import CoreData
import Foundation

public extension Recommendation {
  // Returns the recommendations from other users, filtering out the viewer
  // if they have also recommended the page.
  static func notViewers(viewer: Viewer?, _ set: NSSet?) -> [Recommendation] {
    Array(set ?? [])
      .compactMap { $0 as? Recommendation }
      .filter { $0.user?.userID != viewer?.userID }
  }

  static func byline(_ recommendations: [Recommendation]) -> String {
    recommendations.reduce("") { str, recommendation in
      if let userName = recommendation.user?.name {
        if str.isEmpty {
          return userName
        } else {
          return str + ", " + userName
        }
      }
      return str
    }
  }

  static func groupsLine(_ recommendations: [Recommendation]) -> String {
    recommendations.reduce("") { str, recommendation in
      if let name = recommendation.name {
        if str.isEmpty {
          return name
        } else {
          return str + ", " + name
        }
      }
      return str
    }
  }
}
