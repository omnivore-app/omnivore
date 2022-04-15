import CoreData
import Foundation

public struct FeedItemLabel: Decodable, Hashable {
  public let id: String
  public let name: String
  public let color: String
  public let createdAt: Date?
  public let labelDescription: String?

  public init(
    id: String,
    name: String,
    color: String,
    createdAt: Date?,
    labelDescription: String?
  ) {
    self.id = id
    self.name = name
    self.color = color
    self.createdAt = createdAt
    self.labelDescription = labelDescription
  }

  func toManagedObject(inContext context: NSManagedObjectContext) -> FeedItemLabelManagedObject? {
    let entityName = FeedItemLabelManagedObject.entityName
    guard let entityDescription = NSEntityDescription.entity(forEntityName: entityName, in: context) else {
      print("Failed to create \(entityName)")
      return nil
    }

    let object = FeedItemLabelManagedObject(entity: entityDescription, insertInto: context)
    object.id = id
    object.name = name
    object.color = color
    object.createdAt = createdAt
    object.labelDescription = labelDescription
    return object
  }
}

public class FeedItemLabelManagedObject: NSManagedObject {
  static let entityName = "FeedItemLabelManagedObject"

  @NSManaged public var id: String
  @NSManaged public var name: String
  @NSManaged public var color: String
  @NSManaged public var createdAt: Date?
  @NSManaged public var labelDescription: String?
}
