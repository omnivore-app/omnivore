import Models
import SwiftGraphQL

let highlightSelection = Selection.Highlight {
  InternalHighlight(
    id: try $0.id(),
    shortId: try $0.shortId(),
    quote: try $0.quote(),
    prefix: try $0.prefix(),
    suffix: try $0.suffix(),
    patch: try $0.patch(),
    annotation: try $0.annotation(),
    createdAt: try $0.createdAt().value,
    updatedAt: try $0.updatedAt().value,
    createdByMe: try $0.createdByMe()
  )
}

let highlightDepSelection = Selection.Highlight {
  HighlightDep(
    id: try $0.id(),
    shortId: try $0.shortId(),
    quote: try $0.quote(),
    prefix: try $0.prefix(),
    suffix: try $0.suffix(),
    patch: try $0.patch(),
    annotation: try $0.annotation(),
    createdByMe: try $0.createdByMe()
  )
}
