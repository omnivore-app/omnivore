import CoreData
import Foundation

public extension Recommendation {
  static func byline(_ set: NSSet) -> String {
    Array(set).reduce("") { str, item in
      if let recommendation = item as? Recommendation, let userName = recommendation.user?.name {
        if str.isEmpty {
          return userName
        } else {
          return str + ", " + userName
        }
      }
      return str
    }
  }

  static func groupsLine(_ set: NSSet) -> String {
    Array(set).reduce("") { str, item in
      if let recommendation = item as? Recommendation, let name = recommendation.name {
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
