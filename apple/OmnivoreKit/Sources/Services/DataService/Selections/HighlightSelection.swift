import Foundation
import Models
import SwiftGraphQL

let highlightLabelSelection = Selection.Label {
  InternalLinkedItemLabel(
    id: try $0.id(),
    name: try $0.name(),
    color: try $0.color(),
    createdAt: try $0.createdAt()?.value,
    labelDescription: try $0.description()
  )
}

let highlightSelection = Selection.Highlight {
  InternalHighlight(
    id: try $0.id(),
    type: (try $0.type()).rawValue,
    shortId: try $0.shortId(),
    quote: try $0.quote() ?? "",
    prefix: try $0.prefix(),
    suffix: try $0.suffix(),
    patch: try $0.patch() ?? "",
    annotation: try $0.annotation(),
    createdAt: try $0.createdAt().value,
    updatedAt: try $0.updatedAt()?.value ?? Date(),
    createdByMe: try $0.createdByMe(),
    createdBy: try $0.user(selection: userProfileSelection),
    positionPercent: try $0.highlightPositionPercent(),
    positionAnchorIndex: try $0.highlightPositionAnchorIndex(),
    color: try $0.color(),
    labels: try $0.labels(selection: highlightLabelSelection.list.nullable) ?? []
  )
}
