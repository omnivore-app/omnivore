import Models
import SwiftGraphQL

let feedItemLabelSelection = Selection.Label {
  InternalLinkedItemLabel(
    id: try $0.id(),
    name: try $0.name(),
    color: try $0.color(),
    createdAt: try $0.createdAt()?.value,
    labelDescription: try $0.description()
  )
}
